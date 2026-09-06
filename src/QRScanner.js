// Copyright 2024 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, {useEffect, useState} from "react";
import {ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, Portal, Text, useTheme} from "react-native-paper";
import {Camera, CameraView, scanFromURLAsync} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const QRScanner = ({onScan, onClose, children}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const getPermissions = async() => {
      const current = await Camera.getCameraPermissionsAsync();
      if (current.status === "granted") {
        if (!cancelled) {setHasPermission(true);}
        return;
      }
      if (current.canAskAgain) {
        const req = await Camera.requestCameraPermissionsAsync();
        if (!cancelled) {setHasPermission(req.status === "granted");}
      } else if (!cancelled) {
        setHasPermission(false);
      }
    };
    getPermissions();
    return () => {cancelled = true;};
  }, []);

  const handleBarCodeScanned = ({type, data}) => {
    onScan(type, data);
  };

  const pickImage = async() => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const scannedData = await scanFromURLAsync(result.assets[0].uri, ["qr", "pdf417"]);
      if (scannedData[0]) {
        handleBarCodeScanned({type: scannedData[0].type, data: scannedData[0].data});
      }
    }
  };

  const renderCloseButton = () => (
    <TouchableOpacity
      onPress={onClose}
      style={[styles.closeButton, {top: insets.top + 12}]}
      hitSlop={12}
    >
      <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Portal>
      <View style={[styles.fullscreen, {backgroundColor: "#000"}]}>
        {hasPermission === null && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.statusText}>{t("qrScanner.Requesting permissions")}</Text>
            {renderCloseButton()}
          </View>
        )}

        {hasPermission === false && (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="camera-off-outline" size={64} color="#FFFFFF" />
            <Text style={[styles.statusText, styles.statusTitle]}>
              {t("qrScanner.Camera permission required")}
            </Text>
            <Text style={[styles.statusText, styles.statusDescription]}>
              {t("qrScanner.To scan QR codes, enable camera access in Settings.")}
            </Text>
            <View style={styles.permissionActions}>
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                onPress={() => Linking.openSettings()}
                style={styles.permissionButton}
              >
                {t("qrScanner.Open Settings")}
              </Button>
              <Button
                mode="outlined"
                textColor="#FFFFFF"
                style={[styles.permissionButton, {borderColor: "#FFFFFF"}]}
                onPress={onClose}
              >
                {t("common.cancel")}
              </Button>
            </View>
          </View>
        )}

        {hasPermission === true && (
          <>
            <CameraView
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{barcodeTypes: ["qr", "pdf417"]}}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
            </View>
            {renderCloseButton()}
            <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom + 20, 32)}]}>
              <Button
                icon="image"
                mode="contained"
                onPress={pickImage}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                style={children ? {flex: 1} : {minWidth: 200}}
              >
                {t("qrScanner.Choose Image")}
              </Button>
              {children}
            </View>
          </>
        )}
      </View>
    </Portal>
  );
};

QRScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  statusDescription: {
    fontSize: 14,
    opacity: 0.85,
    marginTop: 6,
  },
  permissionActions: {
    marginTop: 24,
    width: "100%",
    gap: 12,
  },
  permissionButton: {
    borderRadius: 22,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  bottomBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
});

export default QRScanner;
