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

import React, {useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Button, IconButton, Text, TextInput, useTheme} from "react-native-paper";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

export default function EditAccountDetails({onClose, onEdit, placeholder}) {
  const {t} = useTranslation();
  const theme = useTheme();
  const [accountName, setAccountName] = useState(placeholder);

  useEffect(() => {
    setAccountName(placeholder);
  }, [placeholder]);

  const handleConfirm = () => {
    if (accountName.trim() === "") {
      return;
    }
    onEdit(accountName);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.onSurface}]}>
          {t("editAccount.Enter new account name")}
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
        placeholder={placeholder}
        value={accountName}
        onChangeText={setAccountName}
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.inputOutline}
        autoCapitalize="none"
        autoFocus
      />

      <Button
        mode="contained"
        onPress={handleConfirm}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        labelStyle={styles.saveButtonLabel}
      >
        {t("common.save")}
      </Button>
    </View>
  );
}

EditAccountDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
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
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  input: {
    marginBottom: 16,
  },
  inputOutline: {
    borderRadius: 12,
  },
  saveButton: {
    borderRadius: 22,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
  saveButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
