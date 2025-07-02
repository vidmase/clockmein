import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Dummy authorize for build. Replace with real logic as needed.
        if (credentials?.username && credentials?.password) {
          return { id: "1", name: credentials.username };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
};
