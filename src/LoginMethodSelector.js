// Copyright 2023 The Casdoor Authors. All Rights Reserved.
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

import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Modal, Portal, Text, useTheme} from "react-native-paper";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useTranslation} from "react-i18next";

const OPTIONS = [
  {method: "manual", icon: "server-network", labelKey: "loginMethod.Manual Server Setup"},
  {method: "scan", icon: "qrcode-scan", labelKey: "loginMethod.Login Using QR Code"},
  {method: "demo", icon: "play-circle-outline", labelKey: "loginMethod.Try Casdoor Demo Site"},
];

const LoginMethodSheet = ({visible, onDismiss, onSelectMethod}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  const handleSelect = (method) => {
    onDismiss();
    onSelectMethod(method);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
        style={styles.overlay}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom + 12, 24),
            },
          ]}
        >
          <View style={[styles.handle, {backgroundColor: theme.colors.outline}]} />
          <Text style={[styles.title, {color: theme.colors.onSurface}]}>
            {t("loginMethod.Select Login Method")}
          </Text>
          {OPTIONS.map(({method, icon, labelKey}) => (
            <TouchableOpacity
              key={method}
              style={styles.option}
              onPress={() => handleSelect(method)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBubble, {backgroundColor: theme.colors.primaryContainer}]}>
                <MaterialCommunityIcons name={icon} size={22} color={theme.colors.onPrimaryContainer} />
              </View>
              <Text style={[styles.optionText, {color: theme.colors.onSurface}]}>
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.cancel, {backgroundColor: theme.colors.surfaceVariant}]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, {color: theme.colors.onSurfaceVariant}]}>
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    margin: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancel: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default LoginMethodSheet;
