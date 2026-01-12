import mitt from "mitt";

type AuthEvents = {
  login_email_sent: { email: string};
};

export const authEvents = mitt<AuthEvents>();
