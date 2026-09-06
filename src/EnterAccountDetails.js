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

import React, {useCallback, useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, IconButton, Text, TextInput, useTheme} from "react-native-paper";
import {useNotifications} from "react-native-notificated";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const EnterAccountDetails = ({onClose, onAdd, validateSecret}) => {
  const {notify} = useNotifications();
  const {t} = useTranslation();
  const theme = useTheme();
  const [accountName, setAccountName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [secretError, setSecretError] = useState("");
  const [accountNameError, setAccountNameError] = useState("");
  const [selectedType, setSelectedType] = useState("Time based");
  const [showPassword, setShowPassword] = useState(false);

  const handleAddAccount = useCallback(() => {
    if (accountName.trim() === "") {
      setAccountNameError(t("editAccount.Account Name is required"));
    }

    if (secretKey.trim() === "") {
      setSecretError(t("editAccount.Secret Key is required"));
    }

    if (accountName.trim() === "" || secretKey.trim() === "") {
      notify("error", {
        params: {
          title: t("common.error"),
          description: t("editAccount.Please fill in all the fields!"),
        },
      });
      return;
    }

    if (secretError) {
      notify("error", {
        params: {
          title: t("common.error"),
          description: t("editAccount.Invalid Secret Key"),
        },
      });
      return;
    }

    onAdd({accountName, secretKey});
    setAccountName("");
    setSecretKey("");
    setAccountNameError("");
    setSecretError("");
  }, [accountName, secretKey, secretError, onAdd, t, notify]);

  const handleSecretKeyChange = useCallback((text) => {
    setSecretKey(text);
    if (validateSecret) {
      const isValid = validateSecret(text);
      setSecretError(isValid || text.trim() === "" ? "" : t("editAccount.Invalid Secret Key"));
    }
  }, [validateSecret, t]);

  const handleAccountNameChange = useCallback((text) => {
    setAccountName(text);
    if (accountNameError) {
      setAccountNameError("");
    }
  }, [accountNameError]);

  const typeOptions = [
    {value: "Time based", icon: "clock-outline", label: t("editAccount.Time based")},
    {value: "Counter based", icon: "counter", label: t("editAccount.Counter based")},
  ];

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.onSurface}]}>
          {t("editAccount.Add Account")}
        </Text>
        <IconButton
          icon="close"
          size={22}
          onPress={onClose}
          iconColor={theme.colors.onSurfaceVariant}
          style={styles.closeButton}
        />
      </View>

      <TextInput
        label={t("editAccount.Account Name")}
        value={accountName}
        onChangeText={handleAccountNameChange}
        error={!!accountNameError}
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.inputOutline}
      />

      <TextInput
        label={t("editAccount.Secret Key")}
        value={secretKey}
        onChangeText={handleSecretKeyChange}
        secureTextEntry={!showPassword}
        error={!!secretError}
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.inputOutline}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <View style={styles.typeRow}>
        {typeOptions.map((opt) => {
          const active = selectedType === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSelectedType(opt.value)}
              activeOpacity={0.8}
              style={[
                styles.typeChip,
                {
                  backgroundColor: active ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                  borderColor: active ? theme.colors.primary : "transparent",
                },
              ]}
            >
              <IconButton
                icon={opt.icon}
                size={18}
                iconColor={active ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant}
                style={styles.typeChipIcon}
              />
              <Text
                style={[
                  styles.typeChipText,
                  {color: active ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant},
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        mode="contained"
        onPress={handleAddAccount}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
        labelStyle={styles.addButtonLabel}
      >
        {t("editAccount.Add Account")}
      </Button>
    </View>
  );
};

EnterAccountDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  validateSecret: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    margin: 0,
  },
  input: {
    marginBottom: 12,
  },
  inputOutline: {
    borderRadius: 12,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  typeChipIcon: {
    margin: 0,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    borderRadius: 22,
  },
  addButtonContent: {
    paddingVertical: 6,
  },
  addButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default EnterAccountDetails;
