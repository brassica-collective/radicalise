import { Stepper, Group, Button, Stack, Textarea, Select, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { CollectiveInvolvementWithDetails, Crew, CrewInvolvement, Interval, OptOutType, ParticipationIntention } from "../api/Api";
import { IconLock } from "@tabler/icons-react";
import { useAppSelector } from "../store";
import { forPerson, getMatchingInvolvementInterval } from "../store/involvements";
import { ComboTextArea, CrewParticipationsInput } from ".";
import type { ArrayOfStringTuples } from "./forms/ComboTextArea";

export interface MyParticipationFormData {
  wellbeing: string;
  focus: string;
  capacity: string;
  participation_intention: ParticipationIntention | null;
  opt_out_type: OptOutType | null;
  opt_out_planned_return_date: string | null;
  crew_involvements: CrewInvolvement[];
}

type StepProps = {
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
};

function CapacityStep({ form, readOnly }: StepProps) {
  return (
    <Stack>
      <ComboTextArea
        disabled={readOnly}
        rows={4}
        label="Wellbeing"
        description="How is your wellbeing and energy?"
        key={form.key("wellbeing")}
        hints={
          [
            ["Excitable", "I'm feeling excitable"],
            ["Determined", "I'm feeling determined"],
            ["Mostly well", "I'm feeling mostly well"],
            ["Up and down", "I'm feeling up and down"],
            ["A bit meh", "I'm feeling a bit meh"],
            ["Overwhelmed", "I'm feeling overwhelmed"],
            ["Exhausted", "I'm feeling exhausted"],
          ] as ArrayOfStringTuples
        }
        {...form.getInputProps("wellbeing")}
      />
      <ComboTextArea
        disabled={readOnly}
        label="Focus"
        rows={4}
        description="Where are you likely to be directing your time, energy and attention? Do you have any commitments, events or responsibilities coming up?"
        hints={
          [
            ["surviving", "I'm focusing on surviving"],
            ["care responsibilities", "I'm focusing on care responsibilities"],
            ["generating income", "I'm focusing on generating income"],
            ["travel", "I'm focused on travel opportunities"],
            ["study", "I'm focusing on learning opportunities"],
            ["community projects", "I'm contributing to community projects"],
            ["social connection", "I'm nourishing my social connections"],
          ] as ArrayOfStringTuples
        }
        key={form.key("focus")}
        {...form.getInputProps("focus")}
      />
      <Textarea
        disabled={readOnly}
        label="Capacity"
        rows={4}
        description="Given the context of your life (above), how would you describe your capacity to participate in the Brassica Collective this interval"
        key={form.key("capacity")}
        {...form.getInputProps("capacity")}
      />
    </Stack>
  );
}

type MinimumParticipationStepProps = StepProps & {};

function MinimumParticipationStep({ form, readOnly }: MinimumParticipationStepProps) {
  const [showOptOut, setShowOptOut] = useState(form.values.participation_intention === "OptOut");
  const [showHiatus, setShowHiatus] = useState(form.values.opt_out_type === "Hiatus");

  form.watch("participation_intention", ({ value }) => {
    setShowOptOut(value === "OptOut");
  });

  form.watch("opt_out_type", ({ value }) => {
    setShowHiatus(value === "Hiatus");
  });

  return (
    <Stack>
      <Select
        label="Participation intention"
        description="Would you like to participate in the Brassica Collective this interval?"
        placeholder="Pick value"
        disabled={readOnly}
        data={[
          { label: "Opt-in", value: "OptIn" },
          { label: "Opt-out", value: "OptOut" },
        ]}
        key={form.key("participation_intention")}
        {...form.getInputProps("participation_intention")}
      />
      {showOptOut && (
        <>
          <Select
            label="Opt-out Type"
            description="How would you like to opt-out?"
            placeholder="Pick value"
            disabled={readOnly}
            data={[
              { label: "Pause for now (hiatus)", value: "Hiatus" },
              { label: "Leave indefinately (exit)", value: "Exit" },
            ]}
            key={form.key("opt_out_type")}
            {...form.getInputProps("opt_out_type")}
          />
          {showHiatus && (
            <DatePickerInput
              disabled={readOnly}
              label="Planned return date"
              description="We'll give you a reminder one week before hand (if we've coded that bit)"
              placeholder="Pick date"
              key={form.key("opt_out_planned_return_date")}
              {...form.getInputProps("opt_out_planned_return_date")}
            />
          )}
        </>
      )}
    </Stack>
  );
}

interface AdditionalParticipationStepProps {
  personId: number;
  intervalId: number;
  crewInvolvements: CrewInvolvement[];
  form: ReturnType<typeof useForm<MyParticipationFormData>>;
  readOnly?: boolean;
}

function AdditionalParticipationStep({ form, readOnly, personId, intervalId, crewInvolvements }: AdditionalParticipationStepProps) {
  const crewsMap = useAppSelector((state) => state.crews);
  const crews = Object.values(crewsMap) as Crew[];
  const people = useAppSelector((state) => state.people);

  return (
    <Stack>
      <Title order={3}>Crews</Title>
      {/* <p>{JSON.stringify(form)}</p> */}

      <CrewParticipationsInput
        personId={personId}
        intervalId={intervalId}
        crews={crews}
        people={people}
        disabled={readOnly}
        crewInvolvements={crewInvolvements}
        key={form.key("crew_involvements")}
        {...form.getInputProps("crew_involvements")}
      />
    </Stack>
  );
}

interface ParticipationFormProps {
  personId: number;
  readOnly?: boolean;
  involvement?: CollectiveInvolvementWithDetails | null;
  interval: Interval;
  onSubmit: (data: MyParticipationFormData) => void;
}

export default function ParticipationForm({ personId, interval, readOnly = false, involvement = null, onSubmit }: ParticipationFormProps) {
  const involvements = useAppSelector((state) => state.involvements);
  const involvementInterval = getMatchingInvolvementInterval(involvements, interval.id);
  const crewInvolvements = involvementInterval?.crew_involvements || [];
  const [step, setStep] = useState(0);
  const [additionalParticipationActive, setAdditionalParticipationActive] = useState(involvement?.participation_intention === "OptIn");

  const minStep = 0;
  const maxStep = additionalParticipationActive ? 2 : 1;

  const form = useForm<MyParticipationFormData>({
    mode: "controlled",
    initialValues: {
      wellbeing: involvement?.wellbeing || "",
      focus: involvement?.focus || "",
      capacity: involvement?.capacity || "",
      participation_intention: involvement?.participation_intention || null,
      opt_out_type: involvement?.opt_out_type || null,
      opt_out_planned_return_date: involvement?.opt_out_planned_return_date || null,
      crew_involvements: forPerson(crewInvolvements, personId),
    },

    validate: (values) => {
      let results = {} as Record<keyof MyParticipationFormData, string | null>;

      if (step === 0) {
        results = {
          ...results,
          capacity: values.capacity.length > 0 ? null : "Capacity is required",
        };
      }
      if (step === 1) {
        results = {
          ...results,
          participation_intention: values.participation_intention ? null : "Participation intention is required",
        };
        if (values.participation_intention === "OptOut") {
          results = {
            ...results,
            opt_out_type: values.opt_out_type ? null : "Opt-out type is required",
          };
          if (values.opt_out_type === "Hiatus") {
            results = {
              ...results,
              opt_out_planned_return_date: values.opt_out_planned_return_date ? null : "Planned return date is required",
            };
          }
        }
      }

      return results;
    },
  });

  form.watch("participation_intention", ({ value }) => {
    setAdditionalParticipationActive(value === "OptIn");
  });

  const prevStep = () => setStep((current) => (current > minStep ? current - 1 : current));
  const nextStep = () => setStep((current) => (current < maxStep ? current + 1 : current));
  const nextStepIfValid = () => {
    if (!readOnly && form.validate().hasErrors) return;

    nextStep();
  };
  const setStepIfValid = (newStep: number) => {
    if (!readOnly && form.validate().hasErrors) return;

    const editingExisting = involvement && involvement.id;

    if (editingExisting || newStep <= step + 1) {
      setStep(newStep);
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit, (errors) => console.log("Form submission errors:", errors))}>
      <Stepper active={step} onStepClick={setStepIfValid} iconSize={32}>
        <Stepper.Step label="Capacity">
          <CapacityStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        <Stepper.Step label="Minimum Participation">
          <MinimumParticipationStep form={form} readOnly={readOnly} />
        </Stepper.Step>
        <Stepper.Step label="Additional Participation" disabled={!additionalParticipationActive} allowStepSelect={additionalParticipationActive} icon={additionalParticipationActive ? null : <IconLock size={24} />}>
          <AdditionalParticipationStep form={form} readOnly={readOnly} personId={personId} intervalId={interval.id} crewInvolvements={crewInvolvements} />
        </Stepper.Step>

        <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        {step > minStep && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}
        {step < maxStep && <Button onClick={nextStepIfValid}>Next step</Button>}
        {step === maxStep && !readOnly && <Button type="submit">Submit</Button>}
      </Group>
    </form>
  );
}
