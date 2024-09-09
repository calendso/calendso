"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { getStringAsNumberRequiredSchema } from "@calcom/prisma/zod-utils";
import { Button, TextField, Meta, showToast, Form } from "@calcom/ui";

import { getServerSideProps } from "@lib/settings/admin/orgMigrations/removeUserFromOrg/getServerSideProps";

import PageWrapper from "@components/PageWrapper";

import { getLayout } from "./_OrgMigrationLayout";

export { getServerSideProps };

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Meta
        title="Organization Migration: Revert a user"
        description="Reverts a migration of a user to an organization"
      />
      {children}
    </div>
  );
}

const enum State {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export const getFormSchema = (t: TFunction) =>
  z.object({
    userId: z.union([getStringAsNumberRequiredSchema(t), z.number()]),
    targetOrgId: z.union([getStringAsNumberRequiredSchema(t), z.number()]),
  });

export default function RemoveUserFromOrg() {
  const [state, setState] = useState(State.IDLE);
  const { t } = useLocale();
  const formSchema = getFormSchema(t);
  const form = useForm({
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
  });
  const register = form.register;
  return (
    <Wrapper>
      {/*  Due to some reason auth from website doesn't work if /api endpoint is used. Spent a lot of time and in the end went with submitting data to the same page, because you can't do POST request to a page in Next.js, doing a GET request  */}
      <Form
        form={form}
        className="space-y-6"
        handleSubmit={async (values) => {
          setState(State.LOADING);
          const res = await fetch(`/api/orgMigration/removeUserFromOrg`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });
          let response = null;
          try {
            response = await res.json();
          } catch (e) {
            if (e instanceof Error) {
              showToast(e.message, "error", 10000);
            } else {
              showToast(t("something_went_wrong"), "error", 10000);
            }
            setState(State.ERROR);
            return;
          }
          if (res.status === 200) {
            setState(State.SUCCESS);
            showToast(response.message, "success", 10000);
          } else {
            setState(State.ERROR);
            showToast(response.message, "error", 10000);
          }
        }}>
        <div className="space-y-6">
          <TextField
            label="User ID"
            {...register("userId")}
            required
            placeholder="Enter userId to remove from org"
          />
          <TextField
            className="mb-0"
            label="Target Organization ID"
            type="number"
            required
            {...register("targetOrgId")}
            placeholder="Enter Target organization ID"
          />
        </div>
        <Button type="submit" loading={state === State.LOADING}>
          Remove User from Org along with its teams
        </Button>
      </Form>
    </Wrapper>
  );
}

RemoveUserFromOrg.PageWrapper = PageWrapper;
RemoveUserFromOrg.getLayout = getLayout;
