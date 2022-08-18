import { ArrowDownIcon, ArrowUpIcon, CollectionIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { trpc } from "@calcom/trpc/react";
import { AppGetServerSidePropsContext, AppPrisma, AppUser } from "@calcom/types/AppGetServerSideProps";
import { BooleanToggleGroup } from "@calcom/ui";
import { TextArea } from "@calcom/ui/form/fields";
import { Button, EmptyScreen, SelectField, TextField } from "@calcom/ui/v2";
import { BooleanToggleGroupField } from "@calcom/ui/v2/core/form/BooleanToggleGroup";
import FormCard from "@calcom/ui/v2/core/form/FormCard";

import { inferSSRProps } from "@lib/types/inferSSRProps";

import RoutingShell from "../../components/RoutingShell";
import { getSerializableForm } from "../../lib/getSerializableForm";

export const FieldTypes = [
  {
    label: "Short Text",
    value: "text",
  },
  {
    label: "Number",
    value: "number",
  },
  {
    label: "Long Text",
    value: "textarea",
  },
  {
    label: "Select",
    value: "select",
  },
  {
    label: "MultiSelect",
    value: "multiselect",
  },
  {
    label: "Phone",
    value: "phone",
  },
  {
    label: "Email",
    value: "email",
  },
];

function Field({
  hookForm,
  hookFieldNamespace,
  deleteField,
  fieldIndex,
  moveUp,
  moveDown,
}: {
  hookForm: UseFormReturn<inferSSRProps<typeof getServerSideProps>["form"]>;
  hookFieldNamespace: `fields.${number}`;
  deleteField: {
    check: () => boolean;
    fn: () => void;
  };
  moveUp: {
    check: () => boolean;
    fn: () => void;
  };
  moveDown: {
    check: () => boolean;
    fn: () => void;
  };
}) {
  const [identifier, _setIdentifier] = useState(hookForm.getValues(`${hookFieldNamespace}.identifier`));

  const setUserChangedIdentifier = (val: string) => {
    _setIdentifier(val);
    // Also, update the form identifier so tha it can be persisted
    hookForm.setValue(`${hookFieldNamespace}.identifier`, val);
  };

  const label = hookForm.watch(`${hookFieldNamespace}.label`);

  useEffect(() => {
    if (!hookForm.getValues(`${hookFieldNamespace}.identifier`)) {
      _setIdentifier(label);
    }
  }, [label, hookFieldNamespace, hookForm]);

  return (
    <div
      data-testid="field"
      className="group mb-4 flex w-full items-center justify-between ltr:mr-2 rtl:ml-2">
      <FormCard
        label={label || `Field ${fieldIndex + 1}`}
        moveUp={moveUp}
        moveDown={moveDown}
        deleteField={deleteField}>
        <div className="w-full">
          <div className="mb-6 w-full">
            <TextField
              label="Label"
              type="text"
              placeholder="This is what your users would see"
              required
              {...hookForm.register(`${hookFieldNamespace}.label`)}
              className="block w-full rounded-sm border-gray-300 text-sm"
            />
          </div>
          <div className="mb-6 w-full">
            <TextField
              label="Identifier"
              name="identifier"
              required
              placeholder="Identifies field by this name."
              value={identifier}
              onChange={(e) => setUserChangedIdentifier(e.target.value)}
              className="block w-full rounded-sm border-gray-300 text-sm"
            />
          </div>
          <div className="mb-6 w-full ">
            <Controller
              name={`${hookFieldNamespace}.type`}
              control={hookForm.control}
              render={({ field: { value, onChange } }) => {
                const defaultValue = FieldTypes.find((fieldType) => fieldType.value === value);
                return (
                  <SelectField
                    label="Type"
                    className="data-testid-field-type"
                    options={FieldTypes}
                    onChange={(option) => {
                      if (!option) {
                        return;
                      }
                      onChange(option.value);
                    }}
                    defaultValue={defaultValue}
                  />
                );
              }}
            />
          </div>
          {["select", "multiselect"].includes(hookForm.watch(`${hookFieldNamespace}.type`)) ? (
            <div className="mt-2 block items-center sm:flex">
              <div className="min-w-48 mb-4 sm:mb-0">
                <label htmlFor="label" className="mt-0 flex text-sm font-medium text-neutral-700">
                  Options
                </label>
              </div>

              <div className="w-full">
                <TextArea
                  placeholder="Add 1 option per line"
                  {...hookForm.register(`${hookFieldNamespace}.selectText`)}
                />
              </div>
            </div>
          ) : null}

          <div className="w-full">
            <Controller
              name={`${hookFieldNamespace}.required`}
              control={hookForm.control}
              render={({ field: { value, onChange } }) => {
                return <BooleanToggleGroupField label="Required" value={value} onValueChange={onChange} />;
              }}
            />
          </div>
        </div>
      </FormCard>
    </div>
  );
}
const FormEdit = ({ hookForm, form }) => {
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useContext();

  const mutation = trpc.useMutation("viewer.app_routing_forms.form", {
    onError() {
      showToast(`Something went wrong`, "error");
    },
    onSettled() {
      utils.invalidateQueries([
        "viewer.app_routing_forms.form",
        {
          id: form.id,
        },
      ]);
    },
    onSuccess() {
      showToast(`Form updated successfully.`, "success");
      router.replace(router.asPath);
    },
  });
  const fieldsNamespace = "fields";
  const {
    fields: hookFormFields,
    append: appendHookFormField,
    remove: removeHookFormField,
    swap: swapHookFormField,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore https://github.com/react-hook-form/react-hook-form/issues/6679
  } = useFieldArray({
    control: hookForm.control,
    name: fieldsNamespace,
  });

  const addField = () => {
    appendHookFormField({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      id: uuidv4(),
      // This is same type from react-awesome-query-builder
      type: "text",
      label: "",
    });
  };

  // hookForm.reset(form);
  if (!form.fields) {
    form.fields = [];
  }
  return hookFormFields.length ? (
    <div className="flex flex-col-reverse lg:flex-row">
      <div className="w-full ltr:mr-2 rtl:ml-2">
        <div className="flex w-full flex-col">
          {hookFormFields.map((field, key) => {
            return (
              <Field
                fieldIndex={key}
                hookForm={hookForm}
                hookFieldNamespace={`${fieldsNamespace}.${key}`}
                deleteField={{
                  check: () => hookFormFields.length > 1,
                  fn: () => {
                    removeHookFormField(key);
                  },
                }}
                moveUp={{
                  check: () => key !== 0,
                  fn: () => {
                    swapHookFormField(key, key - 1);
                  },
                }}
                moveDown={{
                  check: () => key !== hookFormFields.length - 1,
                  fn: () => {
                    if (key === hookFormFields.length - 1) {
                      return;
                    }
                    swapHookFormField(key, key + 1);
                  },
                }}
                key={key}
              />
            );
          })}
        </div>
        {hookFormFields.length ? (
          <div className={classNames("flex")}>
            <Button
              data-testid="add-field"
              type="button"
              StartIcon={PlusIcon}
              color="secondary"
              onClick={addField}>
              Add Field
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  ) : (
    <button data-testid="add-field" onClick={addField} className="w-full">
      <EmptyScreen
        Icon={CollectionIcon}
        headline="Create your first field"
        description="Fields are the form fields that the booker would see."
        button={<Button>Create Field</Button>}
      />
    </button>
  );
};
export default function FormEditPage({
  form,
  appUrl,
}: inferSSRProps<typeof getServerSideProps> & { appUrl: string }) {
  const [hookForm, setHookForm] = useState(null);

  return (
    <RoutingShell setHookForm={setHookForm} form={form} appUrl={appUrl} heading={form.name}>
      {hookForm ? <FormEdit hookForm={hookForm} form={form} /> : null}
    </RoutingShell>
  );
}

export const getServerSideProps = async function getServerSideProps(
  context: AppGetServerSidePropsContext,
  prisma: AppPrisma,
  user: AppUser
) {
  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/login",
      },
    };
  }
  const { params } = context;
  if (!params) {
    return {
      notFound: true,
    };
  }
  const formId = params.appPages[0];
  if (!formId || params.appPages.length > 1) {
    return {
      notFound: true,
    };
  }
  const form = await prisma.app_RoutingForms_Form.findUnique({
    where: {
      id: formId,
    },
    include: {
      _count: {
        select: {
          responses: true,
        },
      },
    },
  });

  if (!form) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      form: getSerializableForm(form),
    },
  };
};
