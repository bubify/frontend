import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, FormControlLabel, IconButton, Modal, Typography } from "@material-ui/core";
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
import { AchievementsResponse } from "../../../models/AchievementsResponse";
import { DemonstrateRequest } from "../../../models/DemonstrateRequest";
import { User } from "../../../models/User";
import axios from "../../../utils/axios";
import AchievementHoverLabel from "../../achievementHoverLabel";
import UserProfile from "../../userProfile";
import GenericTable from "../../genericTable";
import GradeStudent, { SelectedDemonstration } from "../../gradeStudent/GradeStudent";
import PassedTime from "../../passedTime";
import { withUser } from "../../userContext";
import { EContextValue } from "../../userContext/UserContext";
import VideoCallButton from "../../videoCallButton";
import { DemonstrateTableData } from "./DemonstrateTableStudent";

const useStyles = makeStyles({
  table: {},
  cell: {
    width: "40%",
  },
  timeCell: {
    minWidth: "2vh",
  },
  achievementCell: {
    minWidth: "20vh",
  },
  optionalColumn: {
    // eslint-disable-next-line
    ['@media (max-width:800px)']: {
      display: "none" as "none"
    }
  }
});

interface DemonstrateTableProps {
  recent: DemonstrateRequest[] | undefined;
  demonstrationRequests: DemonstrateTableData[] | undefined;
}

function DemonstrateTableTeacher(props: DemonstrateTableProps & EContextValue) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [gradeModalOpen, setGradeModalOpen] = React.useState(false);
  const [toggleZoomLinks, setToogleZoomLinks] = React.useState(false);
  const [
    selectedDemonstration,
    setSelectedDemonstration,
  ] = React.useState<null | SelectedDemonstration>(null);

  const toggleZoom = () => {
    setToogleZoomLinks(!toggleZoomLinks);
  }

  const rows = props.demonstrationRequests;
  const recentRows = props.recent;

  const claimRequest = async function claimRequest(demoId: string) {
    const id = props?.user?.id;
    if (id) {
      try {
        const response = await axios.post("/demonstration/claim", demoId);
        if (response.status === 200)
          toast(t("DemonstrateTableTeacher.toastClaimed"), { type: "success" });
      } catch (e) { }
    }
  };

  const unclaimRequest = function claimRequest(demoId: string) {
    const id = props?.user?.id;
    if (id) {
      try {
        axios.post("/demonstration/unclaim", demoId);
      } catch (e) { }
    }
  };


  const handleGradeModal = () => {
    setGradeModalOpen(!gradeModalOpen);
  };

  const grade = async function grade(
    demoId: string,
    submitters: User[],
    achievements: AchievementsResponse[]
  ) {
    setSelectedDemonstration({
      demoId,
      submitters,
      achievements,
    });
    handleGradeModal();
  };

  const head = (
    <TableRow>
      <TableCell className={classes.cell} align="left">
        {t("TableCommon.requesters")}
      </TableCell>
      <TableCell className={classes.timeCell} align="left">
        {t("TableCommon.time")}
      </TableCell>
      <TableCell className={classes.optionalColumn} align="left">{t("TableCommon.claimedBy")}</TableCell>
      <TableCell align="left">
        <MediaQuery maxWidth={800}>
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
      <TableCell className={classes.optionalColumn} align="left">{t("TableCommon.grade")}</TableCell>
      <TableCell align="left">
        {t("TableCommon.selectedAchievements")}
      </TableCell>
    </TableRow>
  );

  const body: JSX.Element | undefined = !rows ? undefined : (
    <>
      {rows.map((row) => {
        const ownedByUser = row?.examiner?.id === props?.user?.id;
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
            <TableCell align="left" className={classes.timeCell}>
              <PassedTime date={row.time} />
            </TableCell>
            <TableCell className={classes.optionalColumn} align="left">
              {row.examiner ? (
                <UserProfile user={row.examiner} />
              ) : (
                  <p></p>
                )}
            </TableCell>
            <TableCell align="left">
              {ownedByUser ? (
                <p>
                  <Tooltip title={t("TableCommon.unclaimThis") as string}>
                    <IconButton
                      aria-label="request"
                      onClick={() => {
                        unclaimRequest(row.id);
                      }}
                    >
                      <BlockIcon
                        style={{
                          fill: "black",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <MediaQuery maxWidth={800}>
                    <Button
                    onClick={() => {
                      grade(row.id, row.submitters, row.achievements);
                    }}
                  >
                    {t("TableCommon.grade")}
                  </Button>
                </MediaQuery>
                </p>
              ) : null}
              {!row.examiner ? (
                <p>
                  {
                    <Tooltip title={t("TableCommon.claimThis") as string}>
                      <IconButton
                        aria-label="request"
                        onClick={() => {
                          claimRequest(row.id);
                        }}
                      >
                        <CheckIcon
                          style={{
                            fill: "black",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
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
                <Button
                  onClick={() => {
                    grade(row.id, row.submitters, row.achievements);
                  }}
                >
                  {t("TableCommon.grade")}
                </Button>
              ) : (
                  <p></p>
                )}
            </TableCell>
            <TableCell align="left" className={classes.achievementCell}>
              {row.achievements.map((a) => (
                <AchievementHoverLabel
                  key={`my-goal-label-${a.id}`}
                  code={a.code}
                  urlToDescription={a.urlToDescription}
                />
              ))}
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
      <TableCell className={classes.timeCell} align="left">
        Time of request
      </TableCell>
      <TableCell align="left">
        {t("TableCommon.selectedAchievements")}
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
          <TableCell align="left" className={classes.timeCell}>
            {new Date(row.requestTime).toLocaleString()}
          </TableCell>
          <TableCell align="left" className={classes.achievementCell}>
            {row.achievements.map((a) => (
              <AchievementHoverLabel
                key={`my-goal-label-${a.id}`}
                code={a.code}
                urlToDescription={a.urlToDescription}
              />
            ))}
          </TableCell>
        </TableRow>
      )
      )}
    </>
  );

  return (
    <>
      <GenericTable
        skeleton={<Skeleton6row7column />}
        head={head}
        body={body}
      />
      <div style={{ marginTop: "10px" }}>
        <Typography variant="body1">
          <b>My recent claims</b>
        </Typography>
      </div>
      <div style={{ marginTop: "10px" }}>
        <GenericTable head={recentHead} body={recentBody} />
      </div>
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
      <Modal open={gradeModalOpen} onClose={handleGradeModal}>
        <>
          {selectedDemonstration ? (
            <GradeStudent
              handleDialog={handleGradeModal}
              selectedDemonstration={selectedDemonstration}
            />
          ) : null}
        </>
      </Modal>
    </>
  );
}

export default withUser()(DemonstrateTableTeacher);
