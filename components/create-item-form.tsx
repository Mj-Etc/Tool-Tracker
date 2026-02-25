"use client";

import React, { useState } from "react";
import { ToolCase } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { FieldGroup, Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

export function CreateItem() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const submitData = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const response = { name, description };
      await fetch("/api/item/create-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col justify-center items-center">
        <div>
          <ToolCase className="w-20 h-20" />
        </div>
        <CardTitle className="text-xl pb-4">Tool Tracker</CardTitle>
        <CardDescription>
          Enter the item details you want to create
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitData}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Item name</FieldLabel>
              <Input
                id="name"
                autoFocus
                onChange={(e) => setName(e.target.value)}
                type="text"
                value={name}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                aria-colspan={50}
                onChange={(e) => setDescription(e.target.value)}
                aria-rowspan={8}
                type="text"
                value={description}
              />
            </Field>
            <Field>
              <Button disabled={!name || !description} type="submit">
                Submit
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
