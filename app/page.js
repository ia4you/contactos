import { cookies } from "next/headers";
import { GateScreen } from "./components/GateScreen";
import { Landing } from "./components/Landing";

export default function Home() {
  const gateOk = cookies().get("edad_confirmada")?.value === "1";

  if (!gateOk) {
    return <GateScreen />;
  }

  return <Landing />;
}
