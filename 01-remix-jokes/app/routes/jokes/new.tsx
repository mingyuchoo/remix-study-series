import type { ActionFunction } from "remix"
import { useActionData, redirect, json } from "remix";
import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server";

function validateJokeName(name: string) {
    if (name.length < 2) {
        return `That joke's name is too short`;
    }
}

function validateJokeContent(content: string) {
    if (content.length < 10) {
        return `That joke is too short`;
    }
}

type ActionData = {
    formError?: string;
    fieldErrors?: {
        name: string | undefined;
        content: string | undefined;
    };
    fields?: {
        name: string;
        content: string;
    }
}

const badRequest = (data: ActionData) => json(data, { status: 400 });


export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const form = await request.formData();
    const name = form.get("name")
    const content = form.get("content")
    if (
        typeof name !== "string" ||
        typeof content !== "string"
    ) {
        return badRequest({
            formError: `Form not submmited correctly`
        })
    }

    const fieldErrors = {
        name: validateJokeName(name),
        content: validateJokeContent(content)
    }
    const fields = { name, content }
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields });
    }
    const joke = await db.joke.create({
        data: { ...fields, jokesterId: userId }
    });
    return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
    const actionData = useActionData<ActionData>();
    return (
        <div>
            <p>Add your own hilarious joke</p>
            <form method="post">
                <div>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            defaultValue={actionData?.fields?.name}
                            aria-onInvalid={
                                Boolean(actionData?.fieldErrors?.name) || undefined
                            }
                            aria-describedby={
                                actionData?.fieldErrors?.name
                                    ? "name-error"
                                    : undefined
                            }
                        />
                    </label>
                    {actionData?.fieldErrors?.name
                        ? (
                            <p
                                className="form-validation-error"
                                role="alert"
                                id="name-error"
                            >
                                {actionData.fieldErrors.name}
                            </p>
                        ) : null }
                </div>
                <div>
                    <label>
                        Content:
                        <textarea
                            name="content"
                            defaultValue={actionData?.fields?.content}
                            aira-invalid={
                                Boolean(actionData?.fieldErrors?.content) || undefined
                            }
                            aria-describedby={
                                actionData?.fieldErrors?.content
                                    ? "content-error"
                                    : undefined
                            }
                        />
                    </label>
                    {actionData?.fieldErrors?.content
                        ? (
                            <p className="form-validation-error"
                            role="alert"
                            id="content-error"
                            >
                                {actionData.fieldErrors.content}
                            </p>
                        ): null }
                </div>
                <div>
                    <button type="submit" className="button">add</button>
                </div>
            </form>
        </div>
    )
}