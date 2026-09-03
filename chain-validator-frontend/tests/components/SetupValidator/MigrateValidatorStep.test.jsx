import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

jest.mock("../../../src/services/validatorMigration", () => ({
  __esModule: true,
  MIGRATION_ERRORS: {
    NOT_CONFIGURED: "MIGRATION_NOT_CONFIGURED",
    REQUEST_FAILED: "MIGRATION_REQUEST_FAILED",
  },
  submitValidatorMigration: jest.fn(),
}));

import MigrateValidatorStep from "../../../src/components/SetupValidator/MigrateValidatorStep";
import { submitValidatorMigration } from "../../../src/services/validatorMigration";
import theme from "../../../src/theme";

const URL_OK = "https://node.example.com";

const makeFile = (name = "priv_validator_key.json", size = 640) => {
  const file = new File(['{"a":1}'], name, { type: "application/json" });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const renderForm = (props = {}) => {
  const onBack = props.onBack || jest.fn();
  const onComplete = props.onComplete || jest.fn();
  render(
    <MuiThemeProvider theme={theme}>
      <MigrateValidatorStep onBack={onBack} onComplete={onComplete} />
    </MuiThemeProvider>
  );
  return { onBack, onComplete };
};

const urlField = () => screen.getByPlaceholderText(/node\.example\.com/i);
const pwField = () => screen.getByPlaceholderText(/password for your migration file/i);
const fileInput = () => screen.getByLabelText("Migration file");
const cta = (name) => screen.getByRole("button", { name });

const fillAll = () => {
  fireEvent.change(urlField(), { target: { value: URL_OK } });
  fireEvent.change(fileInput(), { target: { files: [makeFile()] } });
  fireEvent.change(pwField(), { target: { value: "s3cret" } });
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.REACT_APP_ALLOW_INSECURE_NODE = "false";
  submitValidatorMigration.mockResolvedValue({ migrationId: "m1" });
});

describe("Migration form — the three required fields", () => {
  it("renders Secure URL, file upload and password", () => {
    renderForm();
    expect(urlField()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose a file/i })).toBeInTheDocument();
    expect(pwField()).toBeInTheDocument();
  });

  it("shows no progress bar above the form", () => {
    renderForm();
    expect(screen.queryByText("Migration Details")).not.toBeInTheDocument();
    expect(screen.queryByText("Complete")).not.toBeInTheDocument();
  });

  it("explains what each field is for", () => {
    renderForm();
    expect(screen.getByText(/address of the validator you're migrating/i)).toBeInTheDocument();
    expect(screen.getByText(/export from your existing validator/i)).toBeInTheDocument();
    expect(screen.getByText(/used once to unlock your migration file/i)).toBeInTheDocument();
  });

  it("does not submit until every field is valid, and says what is missing", async () => {
    renderForm();

    fireEvent.click(cta(/continue/i));
    expect(screen.getByText(/enter the secure url/i)).toBeInTheDocument();
    expect(screen.getByText(/upload your validator migration file/i)).toBeInTheDocument();
    expect(screen.getByText(/enter the password for your migration file/i)).toBeInTheDocument();
    expect(submitValidatorMigration).not.toHaveBeenCalled();

    fireEvent.change(urlField(), { target: { value: URL_OK } });
    fireEvent.click(cta(/continue/i));
    expect(submitValidatorMigration).not.toHaveBeenCalled();

    fireEvent.change(fileInput(), { target: { files: [makeFile()] } });
    fireEvent.click(cta(/continue/i));
    expect(submitValidatorMigration).not.toHaveBeenCalled();

    fireEvent.change(pwField(), { target: { value: "s3cret" } });
    fireEvent.click(cta(/continue/i));
    expect(submitValidatorMigration).toHaveBeenCalledTimes(1);
    await screen.findByText(/migration complete/i);
  });

  it("refuses an insecure URL when the app requires https", () => {
    renderForm();
    fireEvent.change(urlField(), { target: { value: "http://insecure.example.com" } });
    fireEvent.change(fileInput(), { target: { files: [makeFile()] } });
    fireEvent.change(pwField(), { target: { value: "s3cret" } });
    fireEvent.click(cta(/continue/i));
    expect(screen.getByText(/only secure urls/i)).toBeInTheDocument();
    expect(submitValidatorMigration).not.toHaveBeenCalled();
  });
});

describe("Migration form — file handling", () => {
  it("shows the selected file with its size", () => {
    renderForm();
    fireEvent.change(fileInput(), { target: { files: [makeFile("export.json", 4300)] } });
    expect(screen.getByText("export.json")).toBeInTheDocument();
    expect(screen.getByText("4.2 KB")).toBeInTheDocument();
  });

  it("offers replace and remove once a file is chosen", () => {
    renderForm();
    fireEvent.change(fileInput(), { target: { files: [makeFile()] } });
    expect(screen.getByRole("button", { name: /replace/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove priv_validator_key/i })).toBeInTheDocument();
  });

  it("removing the file returns to the chooser", () => {
    renderForm();
    fireEvent.change(fileInput(), { target: { files: [makeFile()] } });
    fireEvent.click(screen.getByRole("button", { name: /remove priv_validator_key/i }));
    expect(screen.getByRole("button", { name: /choose a file/i })).toBeInTheDocument();
    expect(screen.queryByText("priv_validator_key.json")).not.toBeInTheDocument();
  });

  it("accepts only .json in the file picker itself", () => {
    renderForm();
    expect(fileInput()).toHaveAttribute("accept", ".json,application/json");
    expect(screen.getByText(/\.json file only/i)).toBeInTheDocument();
  });

  it("rejects a non-.json file inline", () => {
    renderForm();
    fireEvent.change(urlField(), { target: { value: URL_OK } });
    fireEvent.change(fileInput(), { target: { files: [makeFile("backup.tar.gz")] } });
    fireEvent.change(pwField(), { target: { value: "s3cret" } });
    fireEvent.click(cta(/continue/i));
    expect(screen.getByText(/only \.json files are supported/i)).toBeInTheDocument();
    expect(submitValidatorMigration).not.toHaveBeenCalled();
  });
});

describe("Migration form — password visibility", () => {
  it("masks the password by default", () => {
    renderForm();
    expect(pwField()).toHaveAttribute("type", "password");
  });

  it("toggles between show and hide", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(pwField()).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(pwField()).toHaveAttribute("type", "password");
  });
});

describe("Migration form — validation messages", () => {
  it("names a field that is emptied after being filled", () => {
    renderForm();
    fillAll();
    fireEvent.change(urlField(), { target: { value: "" } });
    fireEvent.click(cta(/continue/i));
    expect(screen.getByText(/enter the secure url/i)).toBeInTheDocument();
    expect(submitValidatorMigration).not.toHaveBeenCalled();
  });

  it("clears a field error as the operator corrects it", () => {
    renderForm();
    fillAll();
    fireEvent.change(urlField(), { target: { value: "nope" } });
    fireEvent.click(cta(/continue/i));
    expect(screen.getByText(/only secure urls/i)).toBeInTheDocument();
    fireEvent.change(urlField(), { target: { value: URL_OK } });
    expect(screen.queryByText(/only secure urls/i)).not.toBeInTheDocument();
  });
});

describe("Migration form — processing, success and failure", () => {
  it("shows a processing state, then success", async () => {
    let resolve;
    submitValidatorMigration.mockReturnValue(new Promise((r) => { resolve = r; }));

    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));

    expect(await screen.findByText(/migrating your validator/i)).toBeInTheDocument();
    expect(cta(/migrating/i)).toBeDisabled();

    await act(async () => { resolve({ migrationId: "m1" }); });

    expect(screen.getByText(/migration complete/i)).toBeInTheDocument();
    // Data lands later, so the success state has to set that expectation
    // rather than leaving the operator on an empty dashboard.
    expect(screen.getByText(/10-15 minutes/i)).toBeInTheDocument();
  });

  it("passes all three values to the service", async () => {
    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));

    await waitFor(() => expect(submitValidatorMigration).toHaveBeenCalledTimes(1));
    const arg = submitValidatorMigration.mock.calls[0][0];
    expect(arg.secureUrl).toBe(URL_OK);
    expect(arg.password).toBe("s3cret");
    expect(arg.file.name).toBe("priv_validator_key.json");
  });

  it("locks the fields while processing", async () => {
    submitValidatorMigration.mockReturnValue(new Promise(() => {}));
    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));

    await screen.findByText(/migrating your validator/i);
    expect(urlField()).toBeDisabled();
    expect(pwField()).toBeDisabled();
  });

  it("submits only once on repeated clicks", async () => {
    submitValidatorMigration.mockReturnValue(new Promise(() => {}));
    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));
    await screen.findByText(/migrating your validator/i);
    fireEvent.click(cta(/migrating/i));
    expect(submitValidatorMigration).toHaveBeenCalledTimes(1);
  });

  it("shows a failure state with a retry", async () => {
    submitValidatorMigration.mockRejectedValue(new Error("MIGRATION_REQUEST_FAILED"));
    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));

    expect(await screen.findByText(/migration failed/i)).toBeInTheDocument();
    expect(screen.getByText(/rejected the request/i)).toBeInTheDocument();
    expect(cta(/try again/i)).toBeEnabled();
  });

  it("explains an unconfigured backend rather than failing obscurely", async () => {
    submitValidatorMigration.mockRejectedValue(new Error("MIGRATION_NOT_CONFIGURED"));
    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));

    expect(await screen.findByText(/isn't available in this environment/i)).toBeInTheDocument();
  });

  it("retrying returns to the editable form", async () => {
    submitValidatorMigration.mockRejectedValue(new Error("MIGRATION_REQUEST_FAILED"));
    renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));
    await screen.findByText(/migration failed/i);

    fireEvent.click(cta(/try again/i));
    expect(screen.queryByText(/migration failed/i)).not.toBeInTheDocument();
    expect(urlField()).toBeEnabled();
  });

  it("hands control back only after success", async () => {
    const { onComplete } = renderForm();
    fillAll();
    fireEvent.click(cta(/continue/i));

    await screen.findByText(/migration complete/i);
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(cta(/go to dashboard/i));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("Migration form — navigation", () => {
  it("can go back to the choice screen before submitting", () => {
    const { onBack } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: /back to onboarding options/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
