import type { TFunction } from "next-i18next";

import { renderEmail } from "..";
import BaseEmail from "./_base-email";

export default class SlugReplacementEmail extends BaseEmail {
  email: string;
  slug: string;
  t: TFunction;

  constructor(email: string, slug: string, t: TFunction) {
    super();
    this.email = email;
    this.slug = slug;
    this.t = t;
  }

  protected getNodeMailerPayload(): Record<string, unknown> {
    return {
      from: `Cal.com <${this.getMailerOptions().from}>`,
      to: this.email,
      subject: this.t("email_subject_slug_replacement", { slug: this.slug }),
      html: renderEmail("SlugReplacementEmail", {
        slug: this.slug,
        t: this.t,
      }),
      text: this.getTextBody(),
    };
  }

  protected getTextBody(): string {
    return this.t("email_text_body_slug_replacement", { slug: this.slug });
  }
}
