import { Tooltip } from "@material-ui/core";
import React from "react";
import { User } from "../../models/User";
import { fullName } from "../../utils/fullName";
import ProfilePicture from "../profilePicture";

interface Props {
  user: User;
}
const UserProfile = (props: Props) => {
  return (
    <>
      <Tooltip
        title={
          props.user.needsProfilePic ? (
            ""
          ) : (
              <div style={{ margin: "10px", textAlign: "center" }}>
                <ProfilePicture customUser={props.user} disableInitials />
              </div>
            )
        }
      >
        <span style={{ display: "inline-block" }}>
          {fullName(props.user)}
        </span>
      </Tooltip>
    </>
  );
};
export default UserProfile;
