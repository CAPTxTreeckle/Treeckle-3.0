import { Button, Icon, Popup } from "semantic-ui-react";
import { saveAs } from "file-saver";
import papaparse from "papaparse";
import { toast } from "react-toastify";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import FileUploader from "../file-uploader";

const userCreationCsvTemplate = new Blob(
  [
    papaparse.unparse({
      fields: ["email", "role (optional/default to resident)"],
      data: [
        ["jeremy@example.com", "resident"],
        ["john@example.com", "organizer"],
        ["jenny@example.com", "admin"],
        ["james@another.example.com"],
      ],
    }),
  ],
  { type: "text/csv;charset=utf-8" },
);

const onDownloadCsvTemplate = () =>
  saveAs(userCreationCsvTemplate, "user creation template.csv");

function UserCreationCsvUploader() {
  const onAcceptCsvFile = (files: File[]) => {
    const csvFile = files[0];

    if (!csvFile) {
      return;
    }

    papaparse.parse<[string, string]>(csvFile, {
      worker: true,
      error: (error) => {
        console.log("Parse CSV file error:", error, error.message);
        toast.error(error.message);
      },
      complete: ({ data }) => {
        // removes column headers
        data.shift();

        console.log(data);

        toast.info("The CSV file content has been successfully parsed.");
      },
    });
  };

  return (
    <>
      <HorizontalLayoutContainer>
        <div>
          <h2>CSV Upload</h2>
        </div>

        <Popup
          content="Download user creation CSV template"
          wide
          trigger={
            <Button
              compact
              icon={
                <Icon>
                  <i className="fas fa-file-csv" />
                </Icon>
              }
              color="blue"
              onClick={onDownloadCsvTemplate}
            />
          }
          position="top center"
          on="hover"
        />
      </HorizontalLayoutContainer>

      <FileUploader
        onAcceptFiles={onAcceptCsvFile}
        icon={<i className="fas fa-file-csv icon" />}
        title="Drag and drop, or click here to upload CSV file."
        accept="text/csv"
      />
    </>
  );
}

export default UserCreationCsvUploader;
