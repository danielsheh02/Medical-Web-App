import React, {Component} from "react";
import '../styles/Search.css'
import {TableCell, withStyles} from "@material-ui/core";

const useStyles = theme => ({
    cells: {
        fontSize: 13
    },
});

class UserCardMessage extends Component {
    constructor(props) {
        super(props);
        this.user = this.props.user;
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <div className={classes.cells}>
                    {this.user.lastname + " " + this.user.firstname}
                </div>
            </React.Fragment>
        );
    }

}

export default withStyles(useStyles)(UserCardMessage)
