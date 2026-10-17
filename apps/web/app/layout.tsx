import type { Metadata } from "next";
import type { ReactElement } from "react";
import { application } from "@/constants/application";
import { createApiConfiguration, readWebEnvironment } from "@/config";
import { StoryAgentWidget } from "@/features/story-agent";
import type { RootLayoutProps } from "@/types";
import "./globals.css";

export const metadata: Metadata = {
  title: application.name,
  description: application.description
};

const RootLayout = ({ children }: RootLayoutProps): ReactElement => {
  const api = createApiConfiguration(readWebEnvironment());

  return (
    <html lang="en">
      <body>{children}<StoryAgentWidget apiBaseUrl={api.baseUrl} /></body>
    </html>
  );
};

export default RootLayout;
