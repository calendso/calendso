import { App_RoutingForms_Form } from ".prisma/client";

export default async function getFormsUsingTheForm(
  prisma: typeof import("@calcom/prisma").default,
  form: Pick<App_RoutingForms_Form, "id" | "userId">
) {
  return await prisma.app_RoutingForms_Form.findMany({
    where: {
      userId: form.userId,
      routes: {
        array_contains: [
          {
            id: form.id,
            routerType: "global",
          },
        ],
      },
    },
  });
}
