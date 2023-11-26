import { PaperProvider } from "react-native-paper";
import MainApp from "./src/Main";
import { LogBox } from "react-native";
import Toast from "react-native-toast-message";
export default function App() {
  LogBox.ignoreAllLogs(true);
  return (
    <PaperProvider>
      <MainApp />
      <Toast />
    </PaperProvider>
  );
}
