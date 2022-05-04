import { saveAs } from "file-saver";
import papaparse from "papaparse";
import { Accept } from "react-dropzone";
import { toast } from "react-toastify";
import { Button, Icon, Popup } from "semantic-ui-react";

import { useAppDispatch } from "../../redux/hooks";
import { addPendingCreationUsersFromCsvDataAction } from "../../redux/slices/user-creation-slice";
import { UserCreationCsvRowData } from "../../types/users";
import FileUploader from "../file-uploader";
import HorizontalLayoutContainer from "../horizontal-layout-container";

const USER_CREATION_CSV_TEMPLATE = new Blob(
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

const acceptedFileTypes: Accept = {
  "text/csv": [".csv"],
};

const onDownloadCsvTemplate = () =>
  saveAs(USER_CREATION_CSV_TEMPLATE, "user creation template.csv");

function UserCreationCsvUploader() {
  const dispatch = useAppDispatch();

  const onAcceptCsvFile = (files: File[]) => {
    const csvFile = files[0];

    if (!csvFile) {
      return;
    }

    papaparse.parse<UserCreationCsvRowData>(csvFile, {
      worker: true,
      error: (error) => {
        console.log("Parse CSV file error:", error, error.message);
        toast.error(error.message);
      },
      complete: ({ data }) => {
        // removes column headers
        data.shift();

        dispatch(addPendingCreationUsersFromCsvDataAction(data));

        toast.info("The CSV file content has been successfully parsed.");
      },
    });
  };

  return (
    <>
      <HorizontalLayoutContainer align="center">
        <span>
          <h2>CSV Upload</h2>
        </span>

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
          hideOnScroll
        />
      </HorizontalLayoutContainer>

      <FileUploader
        onDropAccepted={onAcceptCsvFile}
        icon={<i className="fas fa-file-csv icon" />}
        title="Drag and drop, or click here to upload CSV file."
        accept={acceptedFileTypes}
      />
    </>
  );
}

export default UserCreationCsvUploader;
