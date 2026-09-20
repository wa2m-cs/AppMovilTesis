import { Redirect, Stack } from "expo-router";

import { obtenerRol } from "@/servicios/api";

export default function LayoutTransportista() {

  if (obtenerRol() !== "transportista") {
    return <Redirect href="/activacion" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}