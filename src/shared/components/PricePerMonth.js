import { Typography } from "@material-ui/core";
import { PriceValue } from "./PriceValue";
import { averageBlockTime } from "../utils/priceUtils";
import { averageDaysInMonth } from "../utils/date";

export const PricePerMonth = ({ perBlockValue, typoVariant = "body1" }) => {
  return (
    <Typography variant={typoVariant}>
      <strong>
        <PriceValue value={perBlockValue * (60 / averageBlockTime) * 60 * 24 * averageDaysInMonth} />
      </strong>{" "}
      / month
    </Typography>
  );
};
