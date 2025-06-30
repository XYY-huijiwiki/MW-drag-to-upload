import ky from "ky";

// MediaWiki API: Datei-Hochladen
type UploadFileOptions = {
  filename: string;
  file: File;
  comment?: string;
  text?: string;
  ignoreWarnings?: boolean;
  validateOnly?: boolean;
};
type UploadApiResponse =
  | {
      upload: {
        result: "Success";
        filename: string;
        imageinfo: {
          url: string;
          descriptionurl: string;
          tags?: string[];
        };
        filekey?: string;
      };
    }
  | {
      upload: {
        result: "Warning";
        warnings: {
          exists?: string;
          duplicate?: string;
          ["duplicate-archive"]?: string;
          ["badfilename"]?: string;
          [key: string]: string | undefined;
        };
        filekey: string;
        sessionkey?: string;
      };
    }
  | {
      error: {
        code: string;
        info: string;
      };
    };

async function uploadFile(options: UploadFileOptions) {
  const api = new mw.Api();
  const token = await api.getToken("csrf");

  const formData = new FormData();
  formData.append("file", options.file, options.filename);
  formData.append("filename", options.filename);
  formData.append("action", "upload");
  formData.append("format", "json");
  if (options.comment) formData.append("comment", options.comment);
  if (options.text) formData.append("text", options.text);
  if (options.ignoreWarnings) formData.append("ignorewarnings", "1");
  if (options.validateOnly) formData.append("stash", "1");
  formData.append("token", token);

  const response = await ky
    .post("/api.php", {
      body: formData,
    })
    .json<UploadApiResponse>();

  return response;
}

export { uploadFile };
