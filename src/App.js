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
import {SafeAreaView, Text} from "react-native";

import {Lato_700Bold, useFonts} from "@expo-google-fonts/lato";
import {Roboto_500Medium} from "@expo-google-fonts/roboto";
import * as Crypto from "expo-crypto";
import {NavigationContainer, DefaultTheme as NavLightTheme, DarkTheme as NavDarkTheme} from "@react-navigation/native";
import {PaperProvider} from "react-native-paper";
import {StatusBar} from "expo-status-bar";
import {useColorScheme} from "react-native";
import {darkTheme, lightTheme} from "./theme";
import ContentLoader, {Circle, Rect} from "react-content-loader/native";
import {ZoomInDownZoomOutUp, createNotifications} from "react-native-notificated";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useMigrations} from "drizzle-orm/expo-sqlite/migrator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import "./i18n";

import NavigationBar from "./NavigationBar";
import useThemeStore from "./useThemeStore";
import {db} from "../db/client";
import migrations from "../drizzle/migrations";

const App = () => {
  const {success, error} = useMigrations(db, migrations);
  const [fontsLoaded] = useFonts({
    Lato_700Bold,
    Roboto_500Medium,
  });
  const systemScheme = useColorScheme();
  const {themePreference} = useThemeStore();
  const isDark =
    themePreference === "system" ? systemScheme === "dark" : themePreference === "dark";
  const paperTheme = isDark ? darkTheme : lightTheme;
  const navigationTheme = {
    ...(isDark ? NavDarkTheme : NavLightTheme),
    colors: {
      ...(isDark ? NavDarkTheme : NavLightTheme).colors,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      primary: paperTheme.colors.primary,
    },
  };

  React.useEffect(() => {
    const storeOrigin = async() => {
      let origin = await AsyncStorage.getItem("origin");
      if (!origin) {
        origin = Crypto.randomUUID();
        await AsyncStorage.setItem("origin", origin);
      }
    };
    storeOrigin();
  }, []);

  const {NotificationsProvider} = React.useMemo(() => {
    const globalConfig = {
      borderRadius: 15,
      borderWidth: 0,
      multiline: 3,
      defaultIconType: "no-icon",
      bgColor: paperTheme.colors.surface,
      titleColor: paperTheme.colors.onSurface,
      descriptionColor: paperTheme.colors.onSurfaceVariant,
      accentColor: paperTheme.colors.primary,
    };
    return createNotifications({
      duration: 1600,
      notificationPosition: "top",
      animationConfig: ZoomInDownZoomOutUp,
      isNotch: true,
      notificationWidth: 350,
      defaultStylesSettings: {
        darkMode: isDark,
        globalConfig,
        successConfig: {...globalConfig, accentColor: paperTheme.colors.secondary || paperTheme.colors.primary},
        errorConfig: {...globalConfig, accentColor: paperTheme.colors.error},
        warningConfig: {...globalConfig, accentColor: paperTheme.colors.tertiary || paperTheme.colors.primary},
        infoConfig: {...globalConfig, accentColor: paperTheme.colors.primary},
      },
    });
  }, [isDark, paperTheme]);

  if (error) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: paperTheme.colors.background}}>
        <Text style={{color: paperTheme.colors.error, padding: 24}}>Migration error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!success || !fontsLoaded) {
    return (
      <SafeAreaView style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: paperTheme.colors.background}}>
        <ContentLoader
          speed={2}
          width={300}
          height={150}
          viewBox="0 0 300 150"
          backgroundColor={paperTheme.colors.surfaceVariant}
          foregroundColor={paperTheme.colors.outlineVariant || paperTheme.colors.outline}
        >
          <Circle cx="10" cy="20" r="8" />
          <Rect x="25" y="15" rx="5" ry="5" width="220" height="10" />
          <Circle cx="10" cy="50" r="8" />
          <Rect x="25" y="45" rx="5" ry="5" width="220" height="10" />
          <Circle cx="10" cy="80" r="8" />
          <Rect x="25" y="75" rx="5" ry="5" width="220" height="10" />
          <Circle cx="10" cy="110" r="8" />
          <Rect x="25" y="105" rx="5" ry="5" width="220" height="10" />
        </ContentLoader>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: paperTheme.colors.background}}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <NotificationsProvider>
          <NavigationContainer theme={navigationTheme}>
            <PaperProvider theme={paperTheme}>
              <NavigationBar />
            </PaperProvider>
          </NavigationContainer>
        </NotificationsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
export default App;
