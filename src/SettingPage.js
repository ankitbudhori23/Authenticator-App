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

import React, {useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {Avatar, Button, Dialog, Divider, List, Portal, SegmentedButtons, Text, useTheme} from "react-native-paper";
import * as Application from "expo-application";
import {useTranslation} from "react-i18next";
import Constants, {ExecutionEnvironment} from "expo-constants";
import {SvgUri} from "react-native-svg";

import CasdoorLoginPage, {useCasdoorLogout} from "./CasdoorLoginPage";
import LoginMethodSheet from "./LoginMethodSelector";
import useStore from "./useStorage";
import useThemeStore from "./useThemeStore";
import {Language} from "./Language";

const SettingPage = () => {
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);
  const [loginSheetVisible, setLoginSheetVisible] = useState(false);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const {userInfo, clearAll} = useStore();
  const {themePreference, setThemePreference} = useThemeStore();
  const theme = useTheme();
  const {t} = useTranslation();
  const logout = useCasdoorLogout();

  const handleCasdoorLogin = () => setLoginSheetVisible(true);

  const handleHideLoginPage = () => {
    setShowLoginPage(false);
    setLoginMethod(null);
  };

  const confirmExit = () => {
    setExitDialogVisible(false);
    logout();
    clearAll();
  };

  const versionLabel =
    Constants.executionEnvironment === ExecutionEnvironment.Standalone
      ? Application.nativeApplicationVersion
      : Constants.expoConfig?.version;

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView style={[styles.scrollView, {backgroundColor: theme.colors.background}]}>
        <View style={styles.profile}>
          {userInfo ? (
            <>
              {userInfo.avatar?.endsWith(".svg") ? (
                <View style={styles.avatar}>
                  <SvgUri width="72" height="72" uri={userInfo.avatar} />
                </View>
              ) : (
                <Avatar.Image size={72} source={{uri: userInfo.avatar}} />
              )}
              <Text variant="titleLarge" style={styles.name}>{userInfo.name}</Text>
              <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                {userInfo.email}
              </Text>
            </>
          ) : (
            <>
              <Avatar.Icon size={72} icon="account" style={{backgroundColor: theme.colors.surfaceVariant}} color={theme.colors.onSurfaceVariant} />
              <Button
                mode="contained"
                icon="login"
                onPress={handleCasdoorLogin}
                style={styles.actionButton}
              >
                {t("settings.Sign In")}
              </Button>
            </>
          )}
        </View>

        <Divider />

        <View style={styles.themeSection}>
          <View style={styles.themeHeader}>
            <List.Icon icon="theme-light-dark" color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={styles.themeTitle}>{t("settings.Appearance")}</Text>
          </View>
          <SegmentedButtons
            value={themePreference}
            onValueChange={setThemePreference}
            buttons={[
              {value: "system", label: t("settings.System"), icon: "cellphone"},
              {value: "light", label: t("settings.Light"), icon: "white-balance-sunny"},
              {value: "dark", label: t("settings.Dark"), icon: "weather-night"},
            ]}
            style={styles.themeSegments}
          />
        </View>

        <Divider />

        <List.Item
          title={t("settings.Language")}
          left={props => <List.Icon {...props} icon="translate" />}
          right={() => <Language />}
        />

        <Divider />

        <List.Item
          title={t("settings.Version")}
          description={versionLabel}
          left={props => <List.Icon {...props} icon="information-outline" />}
        />

        {process.env.EXPO_PUBLIC_COMMIT_HASH && (
          <List.Item
            title={t("settings.Commit Hash")}
            description={process.env.EXPO_PUBLIC_COMMIT_HASH.slice(0, 7)}
            left={props => <List.Icon {...props} icon="git" />}
          />
        )}

        {userInfo && (
          <View style={styles.exitSection}>
            <Button
              mode="contained"
              icon="logout"
              onPress={() => setExitDialogVisible(true)}
              style={styles.exitButton}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
            >
              {t("settings.Exit")}
            </Button>
          </View>
        )}

        {showLoginPage && (
          <CasdoorLoginPage
            onWebviewClose={handleHideLoginPage}
            initialMethod={loginMethod}
          />
        )}
      </ScrollView>

      <LoginMethodSheet
        visible={loginSheetVisible}
        onDismiss={() => setLoginSheetVisible(false)}
        onSelectMethod={(method) => {
          setLoginMethod(method);
          setShowLoginPage(true);
        }}
      />

      <Portal>
        <Dialog
          visible={exitDialogVisible}
          onDismiss={() => setExitDialogVisible(false)}
          style={{backgroundColor: theme.colors.surface, borderRadius: 20}}
        >
          <Dialog.Title style={{color: theme.colors.onSurface}}>
            {t("settings.Exit")}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{color: theme.colors.onSurfaceVariant}}>
              {t("settings.Are you sure you want to exit?")}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExitDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>
              {t("common.cancel")}
            </Button>
            <Button onPress={confirmExit} textColor={theme.colors.error}>
              {t("settings.Exit")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  profile: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  name: {
    marginTop: 12,
    fontWeight: "600",
  },
  actionButton: {
    marginTop: 20,
    minWidth: 160,
  },
  avatar: {
    width: 72,
    height: 72,
  },
  themeSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  themeTitle: {
    marginLeft: 4,
  },
  themeSegments: {
    marginTop: 4,
  },
  exitSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  exitButton: {
    borderRadius: 22,
    paddingVertical: 4,
  },
});

export default SettingPage;
