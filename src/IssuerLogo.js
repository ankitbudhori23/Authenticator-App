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

import React, {useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {Image} from "expo-image";

const BRAND_MAP = {
  google: {icon: "google", bg: "#FFFFFF", fg: "#4285F4"},
  gmail: {icon: "gmail", bg: "#FFFFFF", fg: "#EA4335"},
  microsoft: {icon: "microsoft", bg: "#FFFFFF", fg: "#00A4EF"},
  outlook: {icon: "microsoft-outlook", bg: "#0078D4", fg: "#FFFFFF"},
  office: {icon: "microsoft-office", bg: "#D83B01", fg: "#FFFFFF"},
  onedrive: {icon: "microsoft-onedrive", bg: "#0364B8", fg: "#FFFFFF"},
  xbox: {icon: "microsoft-xbox", bg: "#107C10", fg: "#FFFFFF"},
  apple: {icon: "apple", bg: "#000000", fg: "#FFFFFF"},
  icloud: {icon: "apple-icloud", bg: "#3693F3", fg: "#FFFFFF"},
  github: {icon: "github", bg: "#24292E", fg: "#FFFFFF"},
  gitlab: {icon: "gitlab", bg: "#FC6D26", fg: "#FFFFFF"},
  bitbucket: {icon: "bitbucket", bg: "#2684FF", fg: "#FFFFFF"},
  facebook: {icon: "facebook", bg: "#1877F2", fg: "#FFFFFF"},
  messenger: {icon: "facebook-messenger", bg: "#0084FF", fg: "#FFFFFF"},
  instagram: {icon: "instagram", bg: "#E1306C", fg: "#FFFFFF"},
  twitter: {icon: "twitter", bg: "#1DA1F2", fg: "#FFFFFF"},
  x: {icon: "twitter", bg: "#000000", fg: "#FFFFFF"},
  linkedin: {icon: "linkedin", bg: "#0A66C2", fg: "#FFFFFF"},
  reddit: {icon: "reddit", bg: "#FF4500", fg: "#FFFFFF"},
  discord: {icon: "discord", bg: "#5865F2", fg: "#FFFFFF"},
  slack: {icon: "slack", bg: "#4A154B", fg: "#FFFFFF"},
  telegram: {icon: "send-circle", bg: "#2AABEE", fg: "#FFFFFF"},
  whatsapp: {icon: "whatsapp", bg: "#25D366", fg: "#FFFFFF"},
  amazon: {icon: "amazon", bg: "#232F3E", fg: "#FF9900"},
  aws: {icon: "aws", bg: "#232F3E", fg: "#FF9900"},
  paypal: {icon: "credit-card-outline", bg: "#003087", fg: "#FFFFFF"},
  stripe: {icon: "stripe", bg: "#635BFF", fg: "#FFFFFF"},
  dropbox: {icon: "dropbox", bg: "#0061FF", fg: "#FFFFFF"},
  netflix: {icon: "netflix", bg: "#E50914", fg: "#FFFFFF"},
  spotify: {icon: "spotify", bg: "#1DB954", fg: "#FFFFFF"},
  steam: {icon: "steam", bg: "#1B2838", fg: "#FFFFFF"},
  twitch: {icon: "twitch", bg: "#9146FF", fg: "#FFFFFF"},
  youtube: {icon: "youtube", bg: "#FF0000", fg: "#FFFFFF"},
  wordpress: {icon: "wordpress", bg: "#21759B", fg: "#FFFFFF"},
  cloudflare: {icon: "cloud", bg: "#F38020", fg: "#FFFFFF"},
  vercel: {icon: "triangle", bg: "#000000", fg: "#FFFFFF"},
  npm: {icon: "npm", bg: "#CB3837", fg: "#FFFFFF"},
  docker: {icon: "docker", bg: "#2496ED", fg: "#FFFFFF"},
  kubernetes: {icon: "kubernetes", bg: "#326CE5", fg: "#FFFFFF"},
  digitalocean: {icon: "digital-ocean", bg: "#0080FF", fg: "#FFFFFF"},
  proton: {icon: "shield-lock-outline", bg: "#6D4AFF", fg: "#FFFFFF"},
  binance: {icon: "bitcoin", bg: "#F0B90B", fg: "#FFFFFF"},
  coinbase: {icon: "bitcoin", bg: "#0052FF", fg: "#FFFFFF"},
  unifi: {icon: "wifi", bg: "#0559C9", fg: "#FFFFFF"},
  casdoor: {icon: "shield-key", bg: "#4A90E2", fg: "#FFFFFF"},
};

const FALLBACK_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
];

const normalize = (str) => (str || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

const lookupBrand = (issuer) => {
  const key = normalize(issuer);
  if (!key) {return null;}
  if (BRAND_MAP[key]) {return BRAND_MAP[key];}
  const match = Object.keys(BRAND_MAP).find((k) => key.includes(k) || k.includes(key));
  return match ? BRAND_MAP[match] : null;
};

const colorFromName = (name) => {
  const key = normalize(name) || "?";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

const IssuerLogo = ({issuer, accountName, size = 48, style}) => {
  const brand = lookupBrand(issuer);
  const [imageFailed, setImageFailed] = useState(false);
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  };

  if (brand) {
    return (
      <View style={[containerStyle, style, {backgroundColor: brand.bg}]}>
        <MaterialCommunityIcons name={brand.icon} size={Math.round(size * 0.6)} color={brand.fg} />
      </View>
    );
  }

  const cdnKey = normalize(issuer);
  if (cdnKey && !imageFailed) {
    return (
      <View style={[containerStyle, style, {backgroundColor: "#EEEEEE"}]}>
        <Image
          source={{uri: `https://cdn.casbin.org/img/social_${cdnKey}.png`}}
          style={{width: size, height: size}}
          contentFit="cover"
          onError={() => setImageFailed(true)}
          transition={200}
          cachePolicy="memory-disk"
        />
      </View>
    );
  }

  const label = (issuer || accountName || "?").trim().charAt(0).toUpperCase();
  const bg = colorFromName(issuer || accountName);
  return (
    <View style={[containerStyle, style, {backgroundColor: bg}]}>
      <Text style={[styles.letter, {fontSize: Math.round(size * 0.42)}]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  letter: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default IssuerLogo;
