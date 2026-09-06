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

import * as React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";

import {Text, useTheme} from "react-native-paper";
import {useTranslation} from "react-i18next";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const Header = ({navigation, route}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const isSettings = route?.name === "SettingPage";

  const goToSettings = () => navigation.navigate("SettingPage");

  if (isSettings) {
    return (
      <View
        style={[
          styles.container,
          {paddingTop: insets.top + 6, backgroundColor: theme.colors.background},
        ]}
      >
        <View style={styles.row}>
          <Text style={[styles.bigTitle, {color: theme.colors.onBackground}]}>
            {t("navBar.Settings")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + 6, backgroundColor: theme.colors.background},
      ]}
    >
      <View style={styles.row}>
        <Text
          numberOfLines={1}
          style={[styles.bigTitle, {color: theme.colors.onBackground}]}
        >
          Authenticator
        </Text>
        <TouchableOpacity
          onPress={goToSettings}
          style={[styles.circleButton, {backgroundColor: theme.colors.surfaceVariant}]}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="cog" size={22} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bigTitle: {
    fontSize: 28,
    fontWeight: "700",
    flex: 1,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Header;
