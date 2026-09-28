import { Redirect, Stack } from "expo-router";

import { obtenerRol } from "@/servicios/api";

export default function LayoutAdmin() {

  if (obtenerRol() !== "administrador") {
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