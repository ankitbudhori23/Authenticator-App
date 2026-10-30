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

import React, {useEffect, useMemo, useRef, useState} from "react";
import {InteractionManager, KeyboardAvoidingView, Linking, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, Dialog, Modal, Portal, Text, useTheme} from "react-native-paper";
import {TouchableOpacity as GHTouchableOpacity} from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {useNetInfo} from "@react-native-community/netinfo";
import {FlashList} from "@shopify/flash-list";
import {useNotifications} from "react-native-notificated";
import {useTranslation} from "react-i18next";
import Animated, {
  useAnimatedStyle
} from "react-native-reanimated";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {CountdownCircleTimer} from "react-native-countdown-circle-timer";
import {Camera} from "expo-camera";
import * as Clipboard from "expo-clipboard";
import {useNavigation} from "@react-navigation/native";

import SearchBar from "./SearchBar";
import EnterAccountDetails from "./EnterAccountDetails";
import ScanQRCode from "./ScanQRCode";
import EditAccountDetails from "./EditAccountDetails";
import IssuerLogo from "./IssuerLogo";
import {ImportSheet, useImportManager} from "./ImportManager";
import useStore from "./useStorage";
import {useTokenRefresh, validateSecret} from "./totpUtil";
import {CATEGORIES, SORT_MODES, sortAccounts, useAccountSync, useAccounts, useEditAccount} from "./useAccountStore";

const REFRESH_INTERVAL = 10000;

export default function HomePage() {
  const [showOptions, setShowOptions] = useState(false);
  const [showEnterAccountModal, setShowEnterAccountModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [sortMode, setSortMode] = useState(SORT_MODES.SMART);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const {isConnected} = useNetInfo();
  const [canSync, setCanSync] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {userInfo, serverUrl, token} = useStore();
  const {startSync} = useAccountSync();
  const {accounts} = useAccounts();
  const {setAccount, updateAccount, insertAccount, insertAccounts, deleteAccount, toggleFavorite, recordUsage} = useEditAccount();
  const {notify} = useNotifications();
  const {t} = useTranslation();
  const {showImportOptions, visible: importSheetVisible, dismiss: dismissImportSheet, handleSelect: handleImportSelect} = useImportManager((data) => {
    handleAddAccount(data);
  }, (err) => {
    notify("error", {
      params: {
        title: t("homepage.Import error"),
        description: err.message,
      },
    });
  }, () => {
    requestCameraAndScan();
  });

  useEffect(() => {
    setCanSync(Boolean(isConnected && userInfo && serverUrl));
  }, [isConnected, userInfo, serverUrl]);

  useEffect(() => {
    if (canSync) {
      startSync(userInfo, serverUrl, token);

      const timer = setInterval(() => {
        InteractionManager.runAfterInteractions(() => {
          startSync(userInfo, serverUrl, token);
        });
      }, REFRESH_INTERVAL);

      return () => clearInterval(timer);
    }
  }, [startSync, canSync, token]);

  const activeCategories = useMemo(() => {
    const used = new Set();
    accounts.forEach((a) => a.category && used.add(a.category));
    return CATEGORIES.filter((c) => used.has(c.key));
  }, [accounts]);

  const displayedAccounts = useMemo(() => {
    let list = accounts;
    if (showFavoritesOnly) {
      list = list.filter((a) => a.isFavorite);
    }
    if (categoryFilter) {
      list = list.filter((a) => a.category === categoryFilter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) =>
        item.accountName.toLowerCase().includes(q) ||
        (item.issuer && item.issuer.toLowerCase().includes(q))
      );
    }
    return sortAccounts(list, sortMode);
  }, [accounts, showFavoritesOnly, categoryFilter, searchQuery, sortMode]);

  const onRefresh = async() => {
    setRefreshing(true);
    if (canSync) {
      const syncError = await startSync(userInfo, serverUrl, token);
      if (syncError) {
        notify("error", {params: {title: "Sync error", description: syncError}});
      } else {
        notify("success", {params: {title: "Sync success", description: "All your accounts are up to date."}});
      }
    }
    setRefreshing(false);
  };

  const handleAddAccount = async(accountDataInput) => {
    if (Array.isArray(accountDataInput)) {
      await insertAccounts(accountDataInput);
    } else {
      await setAccount(accountDataInput);
      await insertAccount();
      closeEnterAccountModal();
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowEditAccountModal(true);
  };

  const onAccountEdit = async(updates) => {
    if (editingAccount) {
      setAccount({
        ...editingAccount,
        ...updates,
        oldAccountName: updates.accountName && updates.accountName !== editingAccount.accountName ? editingAccount.accountName : editingAccount.oldAccountName,
      });
      updateAccount();
      setEditingAccount(null);
      closeEditAccountModal();
    }
  };

  const askDeleteAccount = (account) => {
    setAccountToDelete(account);
  };

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  const cancelDeleteAccount = () => setAccountToDelete(null);

  const closeEditAccountModal = () => setShowEditAccountModal(false);

  const requestCameraAndScan = async() => {
    try {
      const current = await Camera.getCameraPermissionsAsync();
      if (current.status === "granted") {
        setShowScanner(true);
        return;
      }
      if (current.canAskAgain) {
        const request = await Camera.requestCameraPermissionsAsync();
        if (request.status === "granted") {
          setShowScanner(true);
          return;
        }
      }
      setPermissionDialogVisible(true);
    } catch (err) {
      notify("error", {
        params: {
          title: t("common.error"),
          description: err.message,
        },
      });
    }
  };

  const handleScanPress = () => {
    setShowOptions(false);
    requestCameraAndScan();
  };

  const handleCloseScanner = () => setShowScanner(false);

  const handleScanError = (error) => {
    setShowScanner(false);
    notify("error", {
      params: {
        title: t("homepage.Error scanning QR code"),
        description: error,
      },
    });
  };

  const closeOptions = () => {
    setShowOptions(false);
    setShowScanner(false);
  };

  const openEnterAccountModal = () => {
    setShowEnterAccountModal(true);
    closeOptions();
  };

  const openImportAccountModal = () => {
    showImportOptions();
    closeOptions();
  };

  const closeEnterAccountModal = () => setShowEnterAccountModal(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const ACTION_WIDTH = 78;
  const ACTIONS_TOTAL_WIDTH = ACTION_WIDTH * 2;

  const SwipeActionButton = ({icon, label, background, color, onPress, cornerSide}) => {
    const cornerStyle = cornerSide === "left"
      ? {borderTopLeftRadius: 16, borderBottomLeftRadius: 16}
      : cornerSide === "right"
        ? {borderTopRightRadius: 16, borderBottomRightRadius: 16}
        : null;

    return (
      <GHTouchableOpacity
        style={[styles.swipeAction, {width: ACTION_WIDTH, backgroundColor: background}, cornerStyle]}
        onPress={onPress}
      >
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        <Text style={{marginTop: 4, color, fontSize: 12}}>{label}</Text>
      </GHTouchableOpacity>
    );
  };

  const RightActions = ({dragX, swipeableRef, account, onEdit, onDelete}) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{translateX: dragX.value + ACTIONS_TOTAL_WIDTH}],
    }));

    return (
      <Animated.View style={[styles.swipeContainer, {width: ACTIONS_TOTAL_WIDTH}, styleAnimation]}>
        <SwipeActionButton
          icon="pencil"
          label={t("common.edit")}
          background={theme.colors.surfaceVariant}
          color={theme.colors.onSurfaceVariant}
          onPress={() => {
            swipeableRef.current?.close();
            onEdit(account);
          }}
        />
        <SwipeActionButton
          icon="trash-can"
          label={t("common.delete")}
          background={theme.colors.error}
          color={theme.colors.onError}
          cornerSide="right"
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(account);
          }}
        />
      </Animated.View>
    );
  };

  const LeftActions = ({dragX, swipeableRef, account, onToggleFavorite}) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{translateX: dragX.value - ACTION_WIDTH}],
    }));

    return (
      <Animated.View style={[styles.swipeContainer, {width: ACTION_WIDTH}, styleAnimation]}>
        <SwipeActionButton
          icon={account.isFavorite ? "star-off" : "star"}
          label={account.isFavorite ? t("homepage.Unpin") : t("homepage.Pin")}
          background={theme.colors.tertiaryContainer || "#facc15"}
          color={theme.colors.onTertiaryContainer || "#111"}
          cornerSide="left"
          onPress={() => {
            swipeableRef.current?.close();
            onToggleFavorite(account);
          }}
        />
      </Animated.View>
    );
  };

  const copyTokenToClipboard = async(token, account) => {
    const cleanToken = token.replace(/\s/g, "");
    await Clipboard.setStringAsync(cleanToken);
    recordUsage(account.id);
    notify("success", {
      params: {
        title: t("itemDetail.copied"),
        description: account.accountName,
      },
    });
  };

  const handleToggleFavorite = (account) => {
    toggleFavorite(account.id);
    notify("success", {
      params: {
        title: account.isFavorite ? t("homepage.Unpinned") : t("homepage.Pinned"),
        description: account.issuer || account.accountName,
      },
    });
  };

  const ListItem = ({item}) => {
    const {token, timeRemaining} = useTokenRefresh(item.secretKey);
    const isUrgent = timeRemaining <= 5;
    const timerColor = isUrgent ? theme.colors.error : theme.colors.primary;
    const itemSwipeableRef = useRef(null);
    const categoryDef = item.category ? CATEGORIES.find((c) => c.key === item.category) : null;

    return (
      <View style={styles.cardWrapper}>
        <Swipeable
          ref={itemSwipeableRef}
          renderRightActions={(_progress, dragX) => (
            <RightActions
              dragX={dragX}
              swipeableRef={itemSwipeableRef}
              account={item}
              onEdit={handleEditAccount}
              onDelete={askDeleteAccount}
            />
          )}
          renderLeftActions={(_progress, dragX) => (
            <LeftActions
              dragX={dragX}
              swipeableRef={itemSwipeableRef}
              account={item}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          leftThreshold={40}
          rightThreshold={40}
          overshootLeft={false}
          overshootRight={false}
          friction={2}
          enableTrackpadTwoFingerGesture
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => copyTokenToClipboard(token, item)}
            onLongPress={() => navigation.navigate("ItemDetailPage", {item})}
            style={[styles.card, {backgroundColor: theme.colors.surface}]}
          >
            <View>
              <IssuerLogo
                issuer={item.issuer}
                accountName={item.accountName}
                size={48}
                style={styles.cardLogo}
              />
              {categoryDef && (
                <View style={[styles.categoryDot, {backgroundColor: categoryDef.color}]}>
                  <MaterialCommunityIcons name={categoryDef.icon} size={10} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.cardMiddle}>
              <View style={styles.cardNameRow}>
                {item.isFavorite && (
                  <MaterialCommunityIcons name="star" size={14} color="#facc15" style={{marginRight: 4}} />
                )}
                <Text variant="bodyMedium" numberOfLines={1} style={[styles.cardName, {color: theme.colors.onSurfaceVariant}]}>
                  {item.issuer || item.accountName}
                </Text>
              </View>
              <Text style={[styles.cardCode, {color: theme.colors.onSurface}]}>
                {token}
              </Text>
            </View>
            <CountdownCircleTimer
              isPlaying
              duration={30}
              initialRemainingTime={timeRemaining}
              colors={[theme.colors.primary, theme.colors.error]}
              colorsTime={[10, 0]}
              size={34}
              strokeWidth={3}
              trailColor={theme.colors.surfaceVariant}
              onComplete={() => ({shouldRepeat: true, delay: 0})}
            >
              {({remainingTime}) => (
                <Text style={{fontSize: 12, fontWeight: "600", color: timerColor}}>
                  {remainingTime}
                </Text>
              )}
            </CountdownCircleTimer>
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  };

  const FilterChip = ({active, label, icon, color, onPress}) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? (color || theme.colors.primary) : theme.colors.surfaceVariant,
        },
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={active ? "#fff" : theme.colors.onSurfaceVariant}
          style={{marginRight: 4}}
        />
      )}
      <Text style={[styles.filterChipText, {color: active ? "#fff" : theme.colors.onSurfaceVariant}]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const sortModeLabel = {
    [SORT_MODES.SMART]: t("homepage.Smart"),
    [SORT_MODES.ALPHA]: t("homepage.A-Z"),
    [SORT_MODES.RECENT]: t("homepage.Recent"),
    [SORT_MODES.DEFAULT]: t("homepage.Default"),
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {(activeCategories.length > 0 || accounts.some((a) => a.isFavorite)) && (
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <FilterChip
              active={showFavoritesOnly}
              label={t("homepage.Favorites")}
              icon="star"
              color="#facc15"
              onPress={() => setShowFavoritesOnly((v) => !v)}
            />
            {activeCategories.map((cat) => (
              <FilterChip
                key={cat.key}
                active={categoryFilter === cat.key}
                label={t(`categories.${cat.key}`, cat.label)}
                icon={cat.icon}
                color={cat.color}
                onPress={() => setCategoryFilter((prev) => prev === cat.key ? null : cat.key)}
              />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.sortButton, {backgroundColor: theme.colors.surfaceVariant}]}
            onPress={() => setSortSheetVisible(true)}
          >
            <MaterialCommunityIcons name="sort" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={{marginLeft: 4, color: theme.colors.onSurfaceVariant, fontSize: 12}}>
              {sortModeLabel[sortMode]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listWrapper}>
        <FlashList
          data={displayedAccounts}
          keyExtractor={(item) => `${item.id}`}
          estimatedItemSize={92}
          contentContainerStyle={{paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({item}) => <ListItem item={item} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="shield-key-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyText, {color: theme.colors.onSurfaceVariant}]}>
                {searchQuery || categoryFilter || showFavoritesOnly
                  ? t("homepage.No accounts match")
                  : t("homepage.No accounts yet")}
              </Text>
            </View>
          )}
        />
      </View>

      <Portal>
        <Modal
          visible={sortSheetVisible}
          onDismiss={() => setSortSheetVisible(false)}
          contentContainerStyle={styles.sheetContainer}
          style={styles.sheetOverlay}
        >
          <View style={[styles.sheet, {backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom + 12, 24)}]}>
            <View style={[styles.sheetHandle, {backgroundColor: theme.colors.outline}]} />
            <Text style={[styles.sheetTitle, {color: theme.colors.onSurface}]}>
              {t("homepage.Sort by")}
            </Text>
            {Object.entries(sortModeLabel).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={styles.sheetOption}
                activeOpacity={0.7}
                onPress={() => {
                  setSortMode(key);
                  setSortSheetVisible(false);
                }}
              >
                <View style={[styles.sheetIconBubble, {backgroundColor: theme.colors.primaryContainer}]}>
                  <MaterialCommunityIcons
                    name={
                      key === SORT_MODES.SMART ? "auto-fix"
                        : key === SORT_MODES.ALPHA ? "sort-alphabetical-ascending"
                          : key === SORT_MODES.RECENT ? "clock-outline" : "format-list-bulleted"
                    }
                    size={22}
                    color={theme.colors.onPrimaryContainer}
                  />
                </View>
                <Text style={[styles.sheetOptionText, {color: theme.colors.onSurface, flex: 1}]}>
                  {label}
                </Text>
                {sortMode === key && (
                  <MaterialCommunityIcons name="check" size={22} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showOptions}
          onDismiss={closeOptions}
          contentContainerStyle={styles.sheetContainer}
          style={styles.sheetOverlay}
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
            <View style={[styles.sheetHandle, {backgroundColor: theme.colors.outline}]} />
            <Text style={[styles.sheetTitle, {color: theme.colors.onSurface}]}>
              {t("homepage.Add account")}
            </Text>
            <TouchableOpacity style={styles.sheetOption} onPress={handleScanPress} activeOpacity={0.7}>
              <View style={[styles.sheetIconBubble, {backgroundColor: theme.colors.primaryContainer}]}>
                <MaterialCommunityIcons name="qrcode-scan" size={22} color={theme.colors.onPrimaryContainer} />
              </View>
              <Text style={[styles.sheetOptionText, {color: theme.colors.onSurface}]}>
                {t("homepage.Scan QR Code")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={openEnterAccountModal} activeOpacity={0.7}>
              <View style={[styles.sheetIconBubble, {backgroundColor: theme.colors.primaryContainer}]}>
                <MaterialCommunityIcons name="keyboard-outline" size={22} color={theme.colors.onPrimaryContainer} />
              </View>
              <Text style={[styles.sheetOptionText, {color: theme.colors.onSurface}]}>
                {t("homepage.Enter Secret Code")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={openImportAccountModal} activeOpacity={0.7}>
              <View style={[styles.sheetIconBubble, {backgroundColor: theme.colors.primaryContainer}]}>
                <MaterialCommunityIcons name="import" size={22} color={theme.colors.onPrimaryContainer} />
              </View>
              <Text style={[styles.sheetOptionText, {color: theme.colors.onSurface}]}>
                {t("homepage.Import from other app")}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showEnterAccountModal}
          onDismiss={closeEnterAccountModal}
          contentContainerStyle={styles.sheetContainer}
          style={styles.sheetOverlay}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={[styles.formSheet, {paddingBottom: Math.max(insets.bottom + 12, 20)}]}>
              <EnterAccountDetails onClose={closeEnterAccountModal} onAdd={handleAddAccount} validateSecret={validateSecret} />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showEditAccountModal}
          onDismiss={closeEditAccountModal}
          contentContainerStyle={styles.sheetContainer}
          style={styles.sheetOverlay}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={[styles.formSheet, {paddingBottom: Math.max(insets.bottom + 12, 20)}]}>
              <EditAccountDetails onClose={closeEditAccountModal} onEdit={onAccountEdit} account={editingAccount} />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      <ImportSheet
        visible={importSheetVisible}
        onDismiss={dismissImportSheet}
        onSelect={handleImportSelect}
      />

      <Portal>
        <Dialog
          visible={permissionDialogVisible}
          onDismiss={() => setPermissionDialogVisible(false)}
          style={{backgroundColor: theme.colors.surface, borderRadius: 20}}
        >
          <Dialog.Icon icon="camera-off-outline" color={theme.colors.error} />
          <Dialog.Title style={{color: theme.colors.onSurface, textAlign: "center"}}>
            {t("qrScanner.Camera permission required")}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{color: theme.colors.onSurfaceVariant, textAlign: "center"}}>
              {t("qrScanner.To scan QR codes, enable camera access in Settings.")}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPermissionDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={() => {
                setPermissionDialogVisible(false);
                Linking.openSettings();
              }}
              textColor={theme.colors.primary}
            >
              {t("qrScanner.Open Settings")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={accountToDelete !== null}
          onDismiss={cancelDeleteAccount}
          style={{backgroundColor: theme.colors.surface, borderRadius: 20}}
        >
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title style={{color: theme.colors.onSurface, textAlign: "center"}}>
            {t("homepage.Delete account")}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{color: theme.colors.onSurfaceVariant, textAlign: "center"}}>
              {t("homepage.Are you sure you want to delete this account?")}
            </Text>
            {accountToDelete && (
              <Text style={{color: theme.colors.onSurface, textAlign: "center", marginTop: 8, fontWeight: "600"}}>
                {accountToDelete.issuer ? `${accountToDelete.issuer} — ${accountToDelete.accountName}` : accountToDelete.accountName}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDeleteAccount} textColor={theme.colors.onSurfaceVariant}>
              {t("common.cancel")}
            </Button>
            <Button onPress={confirmDeleteAccount} textColor={theme.colors.error}>
              {t("common.delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {showScanner && (
        <ScanQRCode onClose={handleCloseScanner} showScanner={showScanner} onAdd={handleAddAccount} onError={handleScanError} />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.bottomBarWrapper}
      >
        <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 8), backgroundColor: theme.colors.background, borderTopColor: theme.colors.outline}]}>
          <View style={styles.searchArea}>
            <SearchBar onSearch={handleSearch} />
          </View>
          <TouchableOpacity
            style={[styles.plusButton, {backgroundColor: theme.colors.primary}]}
            onPress={() => setShowOptions(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 4,
  },
  cardWrapper: {
    marginVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
  },
  cardLogo: {
    borderRadius: 10,
  },
  categoryDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardMiddle: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
    justifyContent: "center",
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
  cardCode: {
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: 3,
  },
  swipeContainer: {
    flexDirection: "row",
  },
  swipeAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sheetOverlay: {
    justifyContent: "flex-end",
    margin: 0,
  },
  sheetContainer: {
    margin: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
    opacity: 0.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  formSheet: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  bottomBarWrapper: {
    width: "100%",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  searchArea: {
    flex: 1,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    marginRight: 8,
  },
});
