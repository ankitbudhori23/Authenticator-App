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
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, IconButton, Switch, Text, TextInput, useTheme} from "react-native-paper";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

import {CATEGORIES} from "./useAccountStore";

export default function EditAccountDetails({onClose, onEdit, account}) {
  const {t} = useTranslation();
  const theme = useTheme();
  const [accountName, setAccountName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState(null);
  const [notes, setNotes] = useState("");
  const [backupCodes, setBackupCodes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (account) {
      setAccountName(account.accountName || "");
      setIssuer(account.issuer || "");
      setCategory(account.category || null);
      setNotes(account.notes || "");
      setBackupCodes(account.backupCodes || "");
      setIsFavorite(!!account.isFavorite);
    }
  }, [account]);

  const handleConfirm = () => {
    if (accountName.trim() === "") {
      return;
    }
    onEdit({
      accountName: accountName.trim(),
      issuer: issuer.trim() || null,
      category,
      notes: notes || null,
      backupCodes: backupCodes || null,
      isFavorite,
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.onSurface}]}>
          {t("editAccount.Edit account")}
        </Text>
        <IconButton
          icon="close"
          size={22}
          onPress={onClose}
          iconColor={theme.colors.onSurfaceVariant}
          style={styles.closeButton}
        />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" style={{maxHeight: 480}}>
        <TextInput
          label={t("editAccount.Account Name")}
          value={accountName}
          onChangeText={setAccountName}
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          autoCapitalize="none"
          autoFocus
        />

        <TextInput
          label={t("editAccount.Issuer")}
          value={issuer}
          onChangeText={setIssuer}
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />

        <Text style={[styles.sectionLabel, {color: theme.colors.onSurfaceVariant}]}>
          {t("editAccount.Category")}
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(active ? null : cat.key)}
                activeOpacity={0.85}
                style={[
                  styles.categoryChip,
                  {backgroundColor: active ? cat.color : theme.colors.surfaceVariant},
                ]}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={14}
                  color={active ? "#fff" : theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.categoryChipText, {color: active ? "#fff" : theme.colors.onSurfaceVariant}]}>
                  {t(`categories.${cat.key}`, cat.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.favoriteRow}>
          <MaterialCommunityIcons name="star" size={20} color="#facc15" />
          <Text style={[styles.favoriteLabel, {color: theme.colors.onSurface}]}>
            {t("editAccount.Pin to top")}
          </Text>
          <Switch value={isFavorite} onValueChange={setIsFavorite} />
        </View>

        <TextInput
          label={t("editAccount.Notes")}
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />

        <TextInput
          label={t("editAccount.Backup / Recovery codes")}
          value={backupCodes}
          onChangeText={setBackupCodes}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder={t("editAccount.One code per line")}
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />
      </ScrollView>

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
  account: PropTypes.object,
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
    marginBottom: 12,
  },
  inputOutline: {
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
    gap: 8,
  },
  favoriteLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    borderRadius: 22,
    marginTop: 8,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
  saveButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
