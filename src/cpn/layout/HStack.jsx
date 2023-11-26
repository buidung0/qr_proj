import { View } from "react-native";

export default function HStack(props) {
  return (
    <View
      style={{
        ...props?.style,
        justifyContent: props?.justifyContent || "flex-start",
        alignItems: props?.alignItems || "flex-start",
        flex: props?.flex || 1,
        gap: props?.space || 0,
        flexDirection: "row",
      }}
    >
      {props.children}
    </View>
  );
}
