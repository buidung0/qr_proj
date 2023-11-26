import { View } from "react-native";

export default function VStack(props) {
  return (
    <View
      style={{
        ...props?.style,
        padding: props?.padding || 0,
        justifyContent: props?.justifyContent || "flex-start",
        alignItems: props?.alignItems || "flex-start",
        flex: props?.flex,
        gap: props?.space || 0,
        flexDirection: "column",
      }}
    >
      {props.children}
    </View>
  );
}
