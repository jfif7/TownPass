import 'dart:async';

import 'package:get/get.dart';
import 'package:flutter_compass/flutter_compass.dart';

class CompassService extends GetxService {
  late StreamSubscription<CompassEvent> subscription;
  double? heading;

  Future<CompassService> init() async {
    subscription = FlutterCompass.events!.listen((CompassEvent event) {
      heading = event.heading;
    });

    subscription.pause();
    return this;
  }


  Future<void> startMagnetoMeterSession() async {
    if (subscription.isPaused) {
      subscription.resume();
    }
  }

  Future<void> stopMagnetoMeterSession() async {
    if (!subscription.isPaused) {
      subscription.pause();
      heading = null;
    }
  }

  Future<double?> getHeading() async {
    return heading;
  }
}
