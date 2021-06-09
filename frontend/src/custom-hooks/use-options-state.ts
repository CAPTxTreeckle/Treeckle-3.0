import { useState, useEffect } from "react";
import { DropdownItemProps } from "semantic-ui-react";
import { sanitizeArray } from "../utils/parser-utils";

export default function useOptionsState(existingOptions: string[]) {
  const [defaultOptions, setDefaultOptions] = useState<DropdownItemProps[]>([]);
  const [uniqueOptions, setUniqueOptions] = useState<Set<string>>(new Set());
  const [options, setOptions] = useState<DropdownItemProps[]>([]);

  useEffect(() => {
    const uniqueOptions = sanitizeArray(existingOptions);
    const defaultOptions = uniqueOptions.map((option) => ({
      text: option,
      value: option,
    }));

    setDefaultOptions(defaultOptions);
    setUniqueOptions(new Set(uniqueOptions));
    setOptions(defaultOptions);
  }, [existingOptions]);

  const onSelect = (options: string[]) => {
    console.log("Select:", options);
    const newOptions = options
      .filter((option) => !uniqueOptions.has(option))
      .map(
        (option) =>
          ({
            text: option,
            value: option,
          } as DropdownItemProps),
      )
      .concat(defaultOptions);

    setOptions(newOptions);
  };

  return { options, onSelect };
}
