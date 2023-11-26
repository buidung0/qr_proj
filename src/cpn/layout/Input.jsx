import { Button, TextInput } from "react-native-paper";

export const Input = ({ current, setText }) => {
  return (
    <TextInput
      value={current}
      onChangeText={(text) => setText(text)}
      style={{
        width: "90%",
        height: 46,
        borderColor: "white",
        borderWidth: 0,
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: 6,
      }}
    />
  );
};
