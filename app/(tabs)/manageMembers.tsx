import { useGym } from "@/context/GymContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "today" | "active" | "expiring";

export default function MembersScreen() {
  const { members, loadingGym } = useGym();
  // const { user, setUser } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  /*
   * -----------------------------------------
   * DATE HELPERS
   * -----------------------------------------
   */

  const isToday = (dateString?: string) => {
    if (!dateString) return false;

    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;

    const expiry = new Date(dateString).getTime();
    const now = new Date().getTime();

    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return expiry >= now && expiry <= now + sevenDays;
  };

  /*
   * -----------------------------------------
   * MEMBER FILTERING
   * -----------------------------------------
   */

  const filtered = useMemo(() => {
    const result = members.filter((member: any) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        member.name?.toLowerCase().includes(searchText) ||
        member.email?.toLowerCase().includes(searchText) ||
        member.phone?.includes(searchText);

      if (!matchesSearch) {
        return false;
      }

      const passes = member.passes || [];

      /*
       * ACTIVE
       */
      if (activeFilter === "active") {
        return passes.some((pass: any) => pass.status === "ACTIVE");
      }

      /*
       * TODAY
       *
       * Currently based on purchaseDate because
       * the Pass collection does not have a visit/check-in field.
       */
      if (activeFilter === "today") {
        return passes.some((pass: any) => isToday(pass.purchaseDate));
      }

      /*
       * EXPIRING
       *
       * Active passes expiring within 7 days.
       */
      if (activeFilter === "expiring") {
        return passes.some(
          (pass: any) =>
            pass.status === "ACTIVE" && isExpiringSoon(pass.expiryDate),
        );
      }

      /*
       * ALL MEMBERS
       */
      return true;
    });

    return result;
  }, [members, search, activeFilter]);

  /*
   * -----------------------------------------
   * COUNTS
   * -----------------------------------------
   */

  const memberCount = members.length;

  const todayCount = useMemo(() => {
    return members.filter((member: any) => {
      const passes = member.passes || [];

      return passes.some((pass: any) => isToday(pass.purchaseDate));
    }).length;
  }, [members]);

  const activeCount = useMemo(() => {
    return members.filter((member: any) => {
      const passes = member.passes || [];

      return passes.some((pass: any) => pass.status === "ACTIVE");
    }).length;
  }, [members]);

  const expiringCount = useMemo(() => {
    return members.filter((member: any) => {
      const passes = member.passes || [];

      return passes.some(
        (pass: any) =>
          pass.status === "ACTIVE" && isExpiringSoon(pass.expiryDate),
      );
    }).length;
  }, [members]);

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loadingGym) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#23ee09" />

          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * -----------------------------------------
   * FILTER BUTTON
   * -----------------------------------------
   */

  const selectFilter = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  /*
   * -----------------------------------------
   * MEMBER CARD
   * -----------------------------------------
   */

  const renderMember = ({ item }: { item: any }) => {
    const passes = item.passes || [];

    /*
     * Find active pass first.
     * If there isn't one, use the latest pass.
     */
    const pass = passes.find((p: any) => p.status === "ACTIVE") || passes[0];

    const expiryDate = pass?.expiryDate
      ? new Date(pass.expiryDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const isActive = pass?.status === "ACTIVE";

    const expiring = isActive && isExpiringSoon(pass?.expiryDate);

    return (
      <View style={styles.card}>
        {/* Avatar */}

        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#23ee09" />
        </View>

        {/* Member Information */}

        <View style={styles.memberContent}>
          <Text style={styles.name}>{item.name || "Unknown Member"}</Text>

          {pass?.passType && (
            <Text style={styles.plan}>{formatPassType(pass.passType)}</Text>
          )}

          {/* Phone */}

          {item.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color="#888" />

              <Text style={styles.info}>{item.phone}</Text>
            </View>
          )}

          {/* Email */}

          {item.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={14} color="#888" />

              <Text style={styles.info} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          )}

          {/* Expiry */}

          {pass?.expiryDate && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color="#888" />

              <Text style={styles.info}>Expires {expiryDate}</Text>
            </View>
          )}
        </View>

        {/* Status */}

        <View
          style={[
            styles.badge,
            expiring ? styles.orange : isActive ? styles.green : styles.red,
          ]}
        >
          <Text style={styles.badgeText}>
            {expiring ? "Expiring" : isActive ? "Active" : "Expired"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <>
            {/* HEADER */}

            <Text style={styles.title}>Members</Text>

            <Text style={styles.subtitle}>Manage your GymPass community</Text>

            {/* -------------------------------- */}
            {/* STATS */}
            {/* -------------------------------- */}

            <View style={styles.statsRow}>
              <StatCard
                icon="people"
                value={memberCount}
                label="Members"
                active={activeFilter === "all"}
                onPress={() => selectFilter("all")}
              />

              <StatCard
                icon="checkmark-circle"
                value={todayCount}
                label="Today"
                active={activeFilter === "today"}
                onPress={() => selectFilter("today")}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                icon="fitness"
                value={activeCount}
                label="Active"
                active={activeFilter === "active"}
                onPress={() => selectFilter("active")}
              />

              <StatCard
                icon="alarm"
                value={expiringCount}
                label="Expiring"
                active={activeFilter === "expiring"}
                onPress={() => selectFilter("expiring")}
              />
            </View>

            {/* -------------------------------- */}
            {/* SEARCH */}
            {/* -------------------------------- */}

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#23ee09" />

              <TextInput
                placeholder="Search member..."
                placeholderTextColor="#777"
                value={search}
                onChangeText={setSearch}
                style={styles.input}
              />

              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#777" />
                </TouchableOpacity>
              )}
            </View>

            {/* -------------------------------- */}
            {/* CURRENT FILTER */}
            {/* -------------------------------- */}

            <View style={styles.sectionHeader}>
              <Text style={styles.section}>{getFilterTitle(activeFilter)}</Text>

              <Text style={styles.resultCount}>{filtered.length}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={55} color="#333" />

            <Text style={styles.emptyTitle}>No members found</Text>

            <Text style={styles.emptyText}>
              There are no members matching this filter.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/*
 * ============================================
 * STAT CARD
 * ============================================
 */

function StatCard({
  icon,
  value,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.statCard, active && styles.statCardActive]}
    >
      <Ionicons name={icon} size={26} color="#23ee09" />

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/*
 * ============================================
 * HELPERS
 * ============================================
 */

function formatPassType(type?: string) {
  if (!type) return "GymPass";

  return type.charAt(0).toUpperCase() + type.slice(1) + " Pass";
}

function getFilterTitle(filter: FilterType) {
  switch (filter) {
    case "today":
      return "Today";

    case "active":
      return "Active Members";

    case "expiring":
      return "Expiring Soon";

    default:
      return "All Members";
  }
}

/*
 * ============================================
 * STYLES
 * ============================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    paddingHorizontal: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#777",
    marginTop: 12,
    fontSize: 15,
  },

  title: {
    marginTop: "10%",
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.7,
  },

  subtitle: {
    color: "#777",
    marginTop: 5,
    marginBottom: 25,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  statCardActive: {
    borderColor: "#23ee09",
    backgroundColor: "rgba(35,238,9,0.08)",
  },

  statValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  statLabel: {
    color: "#888",
    marginTop: 5,
    fontSize: 13,
  },

  searchBox: {
    backgroundColor: "#111",
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  input: {
    flex: 1,
    color: "white",
    marginLeft: 10,
    fontSize: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  section: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  resultCount: {
    color: "#23ee09",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(35,238,9,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  memberContent: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  plan: {
    color: "#23ee09",
    marginTop: 3,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  info: {
    color: "#888",
    marginLeft: 6,
    fontSize: 11,
    flexShrink: 1,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    marginLeft: 8,
  },

  green: {
    backgroundColor: "rgba(35,238,9,0.18)",
  },

  orange: {
    backgroundColor: "rgba(255,170,0,0.18)",
  },

  red: {
    backgroundColor: "rgba(255,50,50,0.18)",
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
  },

  emptyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
  },

  emptyText: {
    color: "#666",
    marginTop: 7,
    textAlign: "center",
  },
});
