import React, {Component} from "react";
import '../styles/Search.css'
import {TableCell, withStyles} from "@material-ui/core";

const useStyles = theme => ({
    cells: {
        fontSize: 17
    },
});

class UserCard extends Component {
    constructor(props) {
        super(props);
        this.user = this.props.user;
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <TableCell className={classes.cells}>
                        {this.user.initials + " "}
                </TableCell>

                <TableCell className={classes.cells} align="right">
                    {this.user.username}
                </TableCell>

                <TableCell className={classes.cells} align="right">
                    {this.user.role}
                </TableCell>

            </React.Fragment>
        );
    }

}

export default withStyles(useStyles)(UserCard)
