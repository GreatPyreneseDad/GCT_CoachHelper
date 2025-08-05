import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { completeRegistration } from '@/app/actions/auth';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === 'apple' || account?.provider === 'google') {
        // After successful OAuth, complete registration
        if (user.email && user.name) {
          await completeRegistration(
            user.email,
            user.name,
            account.provider
          );
        }
        return true;
      }
      return false;
    },
  },
});

export { handler as GET, handler as POST };