import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { useTranslation } from "react-i18next";
import { Skeleton6row3column } from "../../../constantTemplates/SkeletonTable";
import { AchievementsResponse } from "../../../models/AchievementsResponse";
import { User } from "../../../models/User";
import UserProfile from "../../userProfile";
import GenericTable from "../../genericTable/GenericTable";
import PassedTime from "../../passedTime";
import { withUser } from "../../userContext";
import { EContextValue } from "../../userContext/UserContext";

const useStyles = makeStyles({
  table: {},
  cell: {
    width: "45%",
  },
  timeCell: {
    minWidth: "2vh",
  },
});

export interface DemonstrateTableData {
  id: string;
  submitters: User[];
  time: string;
  examiner: User | null;
  achievements: AchievementsResponse[];
  zoomRoom: string | null;
  zoomPassword: string | null;
  physicalRoom: string | null;
}

interface DemonstrateTableProps {
  demonstrationRequests: DemonstrateTableData[] | undefined;
}

function DemonstrateTableStudent(props: DemonstrateTableProps & EContextValue) {
  const { t } = useTranslation();
  const classes = useStyles();
  const rows = props.demonstrationRequests;

  const head = (
    <TableRow>
      <TableCell className={classes.cell} align="left">
        {t("TableCommon.requesters")}
      </TableCell>
      <TableCell className={classes.timeCell} align="left">
        {t("TableCommon.time")}
      </TableCell>
      <TableCell align="left">{t("TableCommon.claimedBy")}</TableCell>
    </TableRow>
  );

  const body: JSX.Element | undefined = !rows ? undefined : (
    <>
      {rows?.map((row) => {
        const ownedByUser =
          props !== null &&
          row.submitters.some((u) => {
            return u.id.toString() === props?.user?.id.toString();
          });
        const highlight = ownedByUser ? { background: "seashell" } : {};

        return (
          <TableRow key={row.id} style={highlight}>
            <TableCell align="left" className={classes.cell}>
              {row.submitters
                .map((user) => user.firstName + " " + user.lastName)
                .join(", ")}
            </TableCell>
            <TableCell align="left" className={classes.timeCell}>
              <PassedTime date={row.time} />
            </TableCell>
            <TableCell align="left">
              {row.examiner ? <UserProfile user={row.examiner} /> : <p></p>}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );

  return (
    <GenericTable skeleton={<Skeleton6row3column />} head={head} body={body} />
  );
}

export default withUser()(DemonstrateTableStudent);
