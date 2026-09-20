import { Redirect, Stack } from "expo-router";

import { obtenerRol } from "@/servicios/api";

export default function LayoutTecnico() {

  if (obtenerRol() !== "tecnico") {
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