import {
  validateSecureUrl,
  validateMigrationFile,
  validateMigrationPassword,
  formatFileSize,
  MIGRATION_FILE_MAX_BYTES,
} from "../../src/constants/validatorMigration";

const makeFile = (name, size = 512) => {
  const file = new File(["x"], name, { type: "application/octet-stream" });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("Secure URL validation", () => {
  const withInsecure = (allowed, fn) => {
    const prev = process.env.REACT_APP_ALLOW_INSECURE_NODE;
    process.env.REACT_APP_ALLOW_INSECURE_NODE = allowed ? "true" : "false";
    try {
      fn();
    } finally {
      process.env.REACT_APP_ALLOW_INSECURE_NODE = prev;
    }
  };

  it("requires a value", () => {
    expect(validateSecureUrl("")).toMatch(/enter the secure url/i);
    expect(validateSecureUrl("   ")).toMatch(/enter the secure url/i);
  });

  it("accepts an https URL", () => {
    withInsecure(false, () => {
      expect(validateSecureUrl("https://node.example.com")).toBeNull();
    });
  });

  it("rejects plain http when insecure URLs are not allowed", () => {
    withInsecure(false, () => {
      expect(validateSecureUrl("http://node.example.com")).toMatch(
        /only secure urls/i
      );
    });
  });

  it("accepts plain http when the app permits insecure nodes", () => {
    withInsecure(true, () => {
      expect(validateSecureUrl("http://50.30.32.170:26657")).toBeNull();
    });
  });

  it("rejects a value that is not a URL", () => {
    withInsecure(true, () => {
      expect(validateSecureUrl("node.example.com")).toMatch(/starting with/i);
      expect(validateSecureUrl("ftp://node.example.com")).toMatch(/starting with/i);
    });
  });

  it("trims surrounding whitespace", () => {
    withInsecure(false, () => {
      expect(validateSecureUrl("  https://node.example.com  ")).toBeNull();
    });
  });
});

describe("Migration file validation", () => {
  it("requires a file", () => {
    expect(validateMigrationFile(null)).toMatch(/upload your validator/i);
  });

  it("accepts a .json file", () => {
    expect(validateMigrationFile(makeFile("priv_validator_key.json"))).toBeNull();
  });

  it("is case-insensitive about the extension", () => {
    expect(validateMigrationFile(makeFile("EXPORT.JSON"))).toBeNull();
  });

  it.each([
    ["a plain text file", "notes.txt"],
    ["an archive", "backup.tar.gz"],
    ["a key file", "node.key"],
    ["a PEM file", "node.pem"],
    ["a zip", "export.zip"],
    ["no extension at all", "export"],
    ["json in the middle of the name", "export.json.bak"],
  ])("rejects %s", (_label, name) => {
    expect(validateMigrationFile(makeFile(name))).toMatch(
      /only \.json files are supported/i
    );
  });

  it("rejects an empty file", () => {
    expect(validateMigrationFile(makeFile("export.json", 0))).toMatch(
      /empty/i
    );
  });

  it("rejects a file over the size limit", () => {
    expect(
      validateMigrationFile(
        makeFile("export.json", MIGRATION_FILE_MAX_BYTES + 1)
      )
    ).toMatch(/larger than/i);
  });
});

describe("Migration password validation", () => {
  it("requires a value", () => {
    expect(validateMigrationPassword("")).toMatch(/enter the password/i);
  });

  it("accepts any existing password, without imposing a strength policy", () => {
    expect(validateMigrationPassword("a")).toBeNull();
    expect(validateMigrationPassword("short")).toBeNull();
  });

  it("rejects an implausibly long value", () => {
    expect(validateMigrationPassword("x".repeat(300))).toMatch(/or fewer/i);
  });
});

describe("formatFileSize", () => {
  it.each([
    [0, "0 B"],
    [512, "512 B"],
    [1024, "1.0 KB"],
    [4300, "4.2 KB"],
    [10 * 1024 * 1024, "10 MB"],
  ])("formats %s bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });

  it("handles nonsense input", () => {
    expect(formatFileSize(NaN)).toBe("—");
    expect(formatFileSize(-1)).toBe("—");
  });
});
