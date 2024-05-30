import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControlLabel, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import BlockIcon from '@material-ui/icons/Block';
import CheckIcon from "@material-ui/icons/Check";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from "react";
import { useTranslation } from "react-i18next";
import MediaQuery from "react-responsive";
import { toast } from "react-toastify";
import { Skeleton6row7column } from "../../../constantTemplates/SkeletonTable";
import { HelpRequest } from "../../../models/HelpRequest";
import axios from "../../../utils/axios";
import LinkifyText from "../../../utils/linkify";
import UserProfile from "../../userProfile";
import GenericTable from "../../genericTable";
import PassedTime from "../../passedTime";
import { SafeButton } from "../../safeButton/SafeButton";
import { withUser } from "../../userContext";
import { EContextValue } from "../../userContext/UserContext";
import VideoCallButton from "../../videoCallButton";
import { HelpTableData } from "../processHelpRequests";

const useStyles = makeStyles({
  table: {},
  cell: {},
  timeCell: {
    minWidth: "2vh",
  },
  optionalColumn: {
    // eslint-disable-next-line
    ['@media (max-width:800px)']: {
      display: "none" as "none"
    }
  }
});

interface HelpTableProps {
  recent: HelpRequest[] | undefined;
  helpRequests: HelpTableData[] | undefined;
}

function HelpTableTeacher(props: HelpTableProps & EContextValue) {
  const { t } = useTranslation();
  const classes = useStyles();
  const rows = (props as HelpTableProps).helpRequests;
  const recentRows = (props as HelpTableProps).recent;
  const [toggleZoomLinks, setToogleZoomLinks] = React.useState(false);
  const isStudent = props.user?.role === "STUDENT";
  const claimRequest = async function claimRequest(requestId: string) {
    const id = props?.user?.id;
    if (id) {
      try {
        const response = await axios.post("/offerHelp", {
          id: id,
          helpRequestId: requestId,
        });
        if (response.status === 200)
          toast(t("HelpTableTeacher.toastClaimed"), { type: "success" });
      } catch (e) { }
    }
  };

  const unclaimRequest = async function unclaimRequest(requestId: string) {
    try {
      axios.post("/helpRequest/unclaim", {
        helpRequestId: requestId,
      });
    } catch (e) { }
  };

  const markAsDone = async function markAsDone(helpRequestId: string) {
    const id = props?.user?.id;
    if (id) {
      try {
        const response = await axios.post("/markAsDone", {
          helpRequestId,
        });
        if (response.status === 200) {
          toast(t("HelpTableTeacher.toastMarkAsDone"), {
            type: "success",
          });
        }
      } catch (e) { }
    }
  };

  const head: JSX.Element = (
    <TableRow>
      <TableCell className={classes.cell} align="left">
        {t("TableCommon.requesters")}
      </TableCell>
      <TableCell align="left" style={{maxWidth: "12ch"}}>{t("TableCommon.comment")}</TableCell>
      <TableCell className={classes.timeCell} align="left">
        {t("TableCommon.time")}
      </TableCell>
      <TableCell className={classes.optionalColumn} align="left">{t("TableCommon.claimedBy")}</TableCell>
      <TableCell align="left"><MediaQuery maxWidth={800}>
          {(matches) => {
            if (matches) {
              return t("TableCommon.action");
            } else {
              return t("TableCommon.claim");
            }
          }}
        </MediaQuery>
        </TableCell>
      <TableCell align="left" style={{maxWidth: "12ch"}}>{t("TableCommon.location")}</TableCell>
      <TableCell className={classes.optionalColumn} align="left">{t("TableCommon.markAsDone")}</TableCell>
    </TableRow>
  );

  const body: JSX.Element | undefined = !rows ? undefined : (
    <>
      {rows.map((row) => {
        const ownedByUser = row?.helper?.id === props?.user?.id;
        const highlight = ownedByUser ? { background: "seashell" } : {};
        return (
          <TableRow key={row.id} style={highlight}>
            <TableCell align="left" className={classes.cell}>
              {row.submitters.map((submitter, index) => (
                <span key={index} style={{ display: "inline-block", marginRight: "5px" }}>
                  <UserProfile user={submitter} />
                  {index !== row.submitters.length - 1 && ", "}
                </span>
              ))}
            </TableCell>
            <TableCell align="left" className={classes.cell}>
              <LinkifyText>{row.message}</LinkifyText>
            </TableCell>
            <TableCell align="left" className={classes.timeCell}>
              <PassedTime date={row.requestTime} />
            </TableCell>
            <TableCell className={classes.optionalColumn} align="left">

              {row.helper ? (
                <UserProfile user={row.helper} />
              ) : (
                  <p></p>
                )}
            </TableCell>
            <TableCell align="left">
              {ownedByUser ? (
                <p>
                  {<>
                    <Tooltip title={t("TableCommon.unclaimThis") as string}>
                      <IconButton
                        onClick={async () => unclaimRequest(row.id)}
                      >
                        <BlockIcon
                          style={{
                            fill: "black",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    <MediaQuery maxWidth={800}>
                    <SafeButton
                      onClick={async () => {
                        markAsDone(row.id);
                      }}
                    >
                      {t("TableCommon.done")}
                    </SafeButton>
                  </MediaQuery>
                  </>
                  }
                </p>
              ) : null}
              {!row.helper ? (
                <p>
                  {<>
                    <Tooltip title={t("TableCommon.claimThis") as string}>
                      <IconButton
                        onClick={async () => claimRequest(row.id)}
                      >
                        <CheckIcon
                          style={{
                            fill: "black",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    </>
                  }
                </p>
              )
                : <p></p>
              }

            </TableCell>
            <TableCell align="left" style={{maxWidth: "12ch"}}>
              <>
                {props.course?.roomSetting !== "PHYSICAL" && row.physicalRoom === null ?
                  <><VideoCallButton id={row.zoomRoom} disabled={!toggleZoomLinks && !ownedByUser} />
                  <>{ownedByUser && row.zoomPassword ? <div>
                    <br />Password: {row.zoomPassword}</div> : null}
                  </>
                  </>
              : null}
              {row.physicalRoom !== null ? <>{row.physicalRoom}</> : null}</>
            </TableCell>
            <TableCell className={classes.optionalColumn} align="left">
              {ownedByUser ? (
                <SafeButton
                  onClick={async () => {
                    markAsDone(row.id);
                  }}
                >
                  {t("TableCommon.done")}
                </SafeButton>
              ) : (
                  <p></p>
                )}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );

  const recentHead: JSX.Element = (
    <TableRow>
      <TableCell className={classes.cell} align="left">
        {t("TableCommon.requesters")}
      </TableCell>
      <TableCell align="left" style={{maxWidth: "12ch"}}>{t("TableCommon.comment")}</TableCell>
      <TableCell className={classes.timeCell} align="left">
        Time of request
      </TableCell>
    </TableRow>
  );

  const recentBody: JSX.Element | undefined = !recentRows ? undefined : (
    <>
      {recentRows.map((row) => (
        <TableRow key={row.id}>
          <TableCell align="left" className={classes.cell}>
            {row.submitters
              .map((user) => user.firstName + " " + user.lastName)
              .join(", ")}
          </TableCell>
          <TableCell align="left" className={classes.cell}>
            <LinkifyText>{row.message}</LinkifyText>
          </TableCell>
          <TableCell align="left" className={classes.timeCell}>
            {new Date(row.requestTime).toLocaleString()}
          </TableCell>
        </TableRow>
      )
      )}
    </>
  );

  const toggleZoom = () => {
    setToogleZoomLinks(!toggleZoomLinks);
  }

  return (
    <>
      <GenericTable skeleton={<Skeleton6row7column />} head={head} body={body} />
      <div style={{ marginTop: "10px" }}>
        <Typography variant="body1">
          <b>My recent claims</b>
        </Typography>
      </div>
      <div style={{ marginTop: "10px" }}>
        <GenericTable head={recentHead} body={recentBody} />
      </div>
      {!isStudent ?
        <div>
          <Accordion style={{ marginTop: "10px" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Advanced settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <FormControlLabel
                  control={<Checkbox checked={toggleZoomLinks} value={toggleZoomLinks} onChange={toggleZoom} id="physical"/>}
                  label="Always reveal Zoom link"/>
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      : null}
    </>
  );
}

export default withUser()(HelpTableTeacher);
