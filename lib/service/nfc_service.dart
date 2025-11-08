import 'dart:typed_data';

import 'package:nfc_manager/nfc_manager.dart';
import 'package:nfc_manager/nfc_manager_android.dart';
import 'package:get/get.dart';

class NfcService extends GetxService {
  bool isNfcAvailable = false;
  Uint8List? nfcId;

  Future<NfcService> init() async {
    // Check is NFC is available.
    isNfcAvailable = await NfcManager.instance.isAvailable();
    return this;
  }

  Future<void> startNfcSession() async {
    if (!isNfcAvailable) {
      return Future.error('NFC not available');
    }
    // Start the session.
    return await NfcManager.instance.startSession(
      pollingOptions: {NfcPollingOption.iso14443},
      onDiscovered: (NfcTag tag) async {
        nfcId = getId(tag);
      },
    );
  }

  Future<void> stopNfcSession() async {
    nfcId = null;
    return await NfcManager.instance.stopSession();
  }

  Future<String?> readNfc({
    Duration timeout = const Duration(seconds: 30),
    Duration pollInterval = const Duration(milliseconds: 100),
  }) async {
    if (!isNfcAvailable) {
      return Future.error('NFC not available');
    }

    final endTime = DateTime.now().add(timeout);
    
    // Long polling: wait for NFC data to become available
    while (DateTime.now().isBefore(endTime)) {
      if (nfcId != null) {
        String hexId = nfcId!.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join();
        nfcId = null;
        return hexId;
      }
      
      // Wait before checking again
      await Future.delayed(pollInterval);
    }
    
    // Timeout reached, return null
    return null;
  }

  Uint8List? getId(NfcTag tag) {
    var nfcAAndroid = NfcAAndroid.from(tag);
    var nfcBAndroid = NfcBAndroid.from(tag);
    var nfcFAndroid = NfcFAndroid.from(tag);
    var nfcVAndroid = NfcVAndroid.from(tag);
    var isoDepAndroid = IsoDepAndroid.from(tag);
    var mifareClassicAndroid = MifareClassicAndroid.from(tag);
    var mifareUltralightAndroid = MifareUltralightAndroid.from(tag);
    var nfcBarcodeAndroid = NfcBarcodeAndroid.from(tag);
    var ndefAndroid = NdefAndroid.from(tag);
    var ndefFormatableAndroid = NdefFormatableAndroid.from(tag);

    if (ndefAndroid != null) {
      return ndefAndroid.tag.id;
    } else if (nfcAAndroid != null) {
      return nfcAAndroid.tag.id;
    } else if (nfcBAndroid != null) {
      return nfcBAndroid.tag.id;
    } else if (nfcFAndroid != null) {
      return nfcFAndroid.tag.id;
    } else if (nfcVAndroid != null) {
      return nfcVAndroid.tag.id;
    } else if (isoDepAndroid != null) {
      return isoDepAndroid.tag.id;
    } else if (mifareClassicAndroid != null) {
      return mifareClassicAndroid.tag.id;
    } else if (mifareUltralightAndroid != null) {
      return mifareUltralightAndroid.tag.id;
    } else if (nfcBarcodeAndroid != null) {
      return nfcBarcodeAndroid.tag.id;
    } else if (ndefFormatableAndroid != null) {
      return ndefFormatableAndroid.tag.id;
    }
    return null;
  }
}
