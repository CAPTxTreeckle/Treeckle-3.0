import { useEffect, useState } from "react";
import { DropdownItemProps } from "semantic-ui-react";

import { sanitizeArray } from "../utils/parser-utils";

export default function useOptionsState(
  existingOptions: string[] | DropdownItemProps[],
) {
  const [defaultOptions, setDefaultOptions] = useState<DropdownItemProps[]>([]);
  const [uniqueValues, setUniqueValues] = useState<Set<string>>(new Set());
  const [options, setOptions] = useState<DropdownItemProps[]>([]);

  useEffect(() => {
    const defaultOptions: DropdownItemProps[] = (() => {
      if (typeof existingOptions[0] === "string") {
        const uniqueValues = sanitizeArray(existingOptions as string[]);
        setUniqueValues(new Set(uniqueValues));
        return uniqueValues.map((value) => ({
          text: value,
          value,
        }));
      }

      setUniqueValues(
        new Set(
          (existingOptions as DropdownItemProps[]).flatMap(({ value }) =>
            value === undefined ? [] : [value as string],
          ),
        ),
      );
      return existingOptions as DropdownItemProps[];
    })();

    setDefaultOptions(defaultOptions);
    setOptions(defaultOptions);
  }, [existingOptions]);

  const onSelect = (values: string[]) => {
    const newOptions = values
      .filter((value) => !uniqueValues.has(value))
      .map(
        (value) =>
          ({
            text: value,
            value,
          } as DropdownItemProps),
      )
      .concat(defaultOptions);

    setOptions(newOptions);
  };

  return { options, onSelect };
}
