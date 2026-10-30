// Copyright 2025 The Casdoor Authors. All Rights Reserved.
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
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTranslation} from "react-i18next";
import {useNotifications} from "react-native-notificated";
import {useTheme} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import {format} from "date-fns";
import {useLiveQuery} from "drizzle-orm/expo-sqlite";
import {eq} from "drizzle-orm";

import {useTokenRefresh} from "./totpUtil";
import {db} from "../db/client";
import * as schema from "../db/schema";
import {CATEGORIES, useEditAccount} from "./useAccountStore";

const ItemDetailPage = ({route}) => {
  const {item: initialItem} = route.params;
  const navigation = useNavigation();
  const theme = useTheme();
  const {t} = useTranslation();
  const {notify} = useNotifications();
  const {toggleFavorite, recordUsage} = useEditAccount();

  const {data: liveRows} = useLiveQuery(
    db.select().from(schema.accounts).where(eq(schema.accounts.id, initialItem.id))
  );
  const item = liveRows?.[0] || initialItem;

  const [copied, setCopied] = useState(false);
  const [secretVisible, setSecretVisible] = useState(false);
  const [backupVisible, setBackupVisible] = useState(false);
  const [copiedBackupIdx, setCopiedBackupIdx] = useState(null);

  const {token, timeRemaining} = useTokenRefresh(item.secretKey);

  useEffect(() => {
    if (copied) {
      const handle = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(handle);
    }
  }, [copied]);

  const copyText = async(text, message) => {
    await Clipboard.setStringAsync(text.replace(/\s/g, ""));
    notify("success", {
      params: {
        title: t("itemDetail.copied"),
        description: message,
      },
    });
  };

  const copyToken = async() => {
    await Clipboard.setStringAsync(token.replace(/\s/g, ""));
    recordUsage(item.id);
    setCopied(true);
  };

  const copyBackupCode = async(code, idx) => {
    await Clipboard.setStringAsync(code);
    setCopiedBackupIdx(idx);
    setTimeout(() => setCopiedBackupIdx(null), 1500);
  };

  const categoryDef = item.category ? CATEGORIES.find((c) => c.key === item.category) : null;
  const backupCodesList = item.backupCodes
    ? item.backupCodes.split(/\r?\n/).map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.iconBtn}>
          <MaterialCommunityIcons
            name={item.isFavorite ? "star" : "star-outline"}
            size={24}
            color={item.isFavorite ? "#facc15" : theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Text style={[styles.issuer, {color: theme.colors.onSurface}]}>
            {item.issuer || item.accountName}
          </Text>
          {item.issuer && (
            <Text style={[styles.accountName, {color: theme.colors.onSurfaceVariant}]}>
              {item.accountName}
            </Text>
          )}
          {categoryDef && (
            <View style={[styles.categoryBadge, {backgroundColor: categoryDef.color}]}>
              <MaterialCommunityIcons name={categoryDef.icon} size={12} color="#fff" />
              <Text style={styles.categoryBadgeText}>
                {t(`categories.${categoryDef.key}`, categoryDef.label)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={copyToken} activeOpacity={0.8} style={[styles.tokenCard, {backgroundColor: theme.colors.primaryContainer}]}>
          <Text style={[styles.tokenText, {color: theme.colors.onPrimaryContainer}]}>{token}</Text>
          <View style={styles.tokenRow}>
            <View style={[styles.progressBar, {backgroundColor: theme.colors.onPrimaryContainer + "22"}]}>
              <View style={[styles.progressFill, {width: `${(timeRemaining / 30) * 100}%`, backgroundColor: theme.colors.onPrimaryContainer}]} />
            </View>
            <MaterialCommunityIcons
              name={copied ? "check-circle" : "content-copy"}
              size={20}
              color={theme.colors.onPrimaryContainer}
              style={{marginLeft: 12}}
            />
            <Text style={{marginLeft: 6, color: theme.colors.onPrimaryContainer, fontSize: 12, fontWeight: "600"}}>
              {timeRemaining}s
            </Text>
          </View>
        </TouchableOpacity>

        {(item.usageCount > 0 || item.lastUsedAt) && (
          <View style={[styles.statsRow, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="counter" size={20} color={theme.colors.primary} />
              <Text style={[styles.statValue, {color: theme.colors.onSurface}]}>{item.usageCount || 0}</Text>
              <Text style={[styles.statLabel, {color: theme.colors.onSurfaceVariant}]}>{t("itemDetail.usesLabel")}</Text>
            </View>
            <View style={[styles.statDivider, {backgroundColor: theme.colors.outlineVariant || theme.colors.outline}]} />
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.statValue, {color: theme.colors.onSurface, fontSize: 13}]} numberOfLines={1}>
                {item.lastUsedAt ? format(new Date(item.lastUsedAt), "PP") : "—"}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.onSurfaceVariant}]}>{t("itemDetail.lastUsed")}</Text>
            </View>
          </View>
        )}

        {item.notes && (
          <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                {t("itemDetail.notes")}
              </Text>
            </View>
            <Text style={[styles.notesText, {color: theme.colors.onSurfaceVariant}]}>
              {item.notes}
            </Text>
          </View>
        )}

        {backupCodesList.length > 0 && (
          <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lifebuoy" size={18} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                {t("itemDetail.backupCodes")}
              </Text>
              <View style={{flex: 1}} />
              <TouchableOpacity onPress={() => setBackupVisible((v) => !v)}>
                <MaterialCommunityIcons
                  name={backupVisible ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.backupGrid}>
              {backupCodesList.map((code, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => copyBackupCode(code, idx)}
                  style={[styles.backupChip, {backgroundColor: theme.colors.surfaceVariant}]}
                >
                  <Text style={[styles.backupText, {color: theme.colors.onSurface}]}>
                    {backupVisible ? code : "••••••••"}
                  </Text>
                  <MaterialCommunityIcons
                    name={copiedBackupIdx === idx ? "check" : "content-copy"}
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                    style={{marginLeft: 6}}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              {t("itemDetail.details")}
            </Text>
          </View>
          <DetailRow theme={theme} label={t("itemDetail.accountName")} value={item.accountName} />
          <DetailRow theme={theme} label={t("itemDetail.issuer")} value={item.issuer || t("itemDetail.notSpecified")} />
          <DetailRow
            theme={theme}
            label={t("itemDetail.secretKey")}
            value={secretVisible ? item.secretKey : "••••••••••••"}
            action={
              <TouchableOpacity
                onPress={() => setSecretVisible((v) => !v)}
                style={{padding: 4}}
              >
                <MaterialCommunityIcons
                  name={secretVisible ? "eye-off" : "eye"}
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            }
            onCopyRaw={secretVisible ? () => copyText(item.secretKey, t("itemDetail.secretKey")) : null}
          />
          <DetailRow theme={theme} label={t("itemDetail.lastModified")} value={format(new Date(item.changedAt), "PPpp")} />
          <DetailRow
            theme={theme}
            label={t("itemDetail.lastSynced")}
            value={item.syncAt ? format(new Date(item.syncAt), "PPpp") : t("itemDetail.neverSynced")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({theme, label, value, action, onCopyRaw}) => (
  <View style={[styles.detailRow, {borderBottomColor: theme.colors.outlineVariant || theme.colors.outline}]}>
    <View style={styles.detailHeaderRow}>
      <Text style={[styles.detailLabel, {color: theme.colors.onSurfaceVariant}]}>{label}</Text>
      {action}
    </View>
    <TouchableOpacity disabled={!onCopyRaw} onPress={onCopyRaw} activeOpacity={onCopyRaw ? 0.7 : 1}>
      <Text style={[styles.detailValue, {color: theme.colors.onSurface}]}>
        {value}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconBtn: {
    padding: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  identity: {
    alignItems: "center",
    marginBottom: 20,
  },
  issuer: {
    fontSize: 20,
    fontWeight: "700",
  },
  accountName: {
    fontSize: 14,
    marginTop: 2,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tokenCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  tokenText: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 6,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    width: "100%",
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  backupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  backupChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backupText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Roboto_500Medium",
    letterSpacing: 1,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default ItemDetailPage;
