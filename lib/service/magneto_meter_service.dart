import 'dart:async';

import 'package:sensors_plus/sensors_plus.dart';
import 'package:get/get.dart';

class MagnetoMeterService extends GetxService {
  late StreamSubscription<MagnetometerEvent> subscription;
  bool isMagnetoMeterAvailable = true;
  Map<String, dynamic>? magnetoData;

  Future<MagnetoMeterService> init() async {
    subscription = magnetometerEventStream(
            samplingPeriod: const Duration(milliseconds: 50))
        .listen(
      (MagnetometerEvent event) {
        magnetoData = {
          "x": event.x,
          "y": event.y,
          "z": event.z,
        };
      },
      onError: (error) {
        // Logic to handle error
        // Needed for Android in case sensor is not available
        isMagnetoMeterAvailable = false;
      },
      cancelOnError: true,
    );

    subscription.pause();
    await startMagnetoMeterSession();
    return this;
  }

  Future<void> startMagnetoMeterSession() async {
    if (!isMagnetoMeterAvailable) {
      return Future.error('MagnetoMeter not available');
    }
    if (subscription.isPaused) {
      subscription.resume();
    }
  }

  Future<void> stopMagnetoMeterSession() async {
    if (!isMagnetoMeterAvailable) {
      return Future.error('MagnetoMeter not available');
    }

    if (!subscription.isPaused) {
      subscription.pause();
      magnetoData = null;
    }
  }

  Future<Map<String, dynamic>?> getMagnetoData() async {
    return magnetoData;
  }
}
