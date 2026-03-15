"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
} from "./ui/card";
import { FieldGroup, Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { useSocket } from "./socket-provider";

export function CreateItem() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useSocket();

  const submitData = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = { name, description };
      const response = await fetch("/api/item/create-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        toast.error("Failed to create item.");
      }
      sendMessage({ type: "items:created" });
      setName("");
      setDescription("");
      setIsLoading(false);
      toast.success("Item created successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
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
                {isLoading ? (
                  <>
                    <Spinner />
                    Creating item...
                  </>
                ) : (
                  "Add item"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
