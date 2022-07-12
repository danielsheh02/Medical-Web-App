import React, {useEffect, useState} from "react";
import '../../styles/Search.css'
import {ImageList, ImageListItem, Paper, Tooltip, withStyles} from "@material-ui/core";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const useStyles = theme => ({

    msgNotMy: {
        width: "fit-content",
        height: "fit-content",
        margin: 20,
        padding: theme.spacing(0.5),
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        maxWidth: 400,
        elevation: 2,
        backgroundColor: '#eeeeee'
    },
    txt: {
        fontWeight: 'bold',
        marginTop: 0,
        marginBottom: 10
    },
    time: {
        color: '#888888',
        fontSize: 12,
        marginTop: theme.spacing(0.5),
        textAlign: "right"
    },
    link: {
        color: "black",
    }
});

function RecipientMsg(props) {
    const {classes} = props;
    const {msg} = props;
    const {updateStatusMsg} = props
    const {initialsSender} = props
    const {scrollToBottom} = props;
    const [files, setFiles] = useState([])
    const [timeMsgCurrentTimeZone, setTimeMsgCurrentTimeZone] = useState([])
    useEffect(async () => {
        updateStatusMsg(msg)
        await getFiles()
        processTime()
        scrollToBottom()
    }, [msg]);

    function processTime() {
        let timeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone)
        const difsTimeZones = getOffsetBetweenTimezonesForDate(new Date(), msg.timeZone, timeZone)
        setTimeMsgCurrentTimeZone(new Date(new Date(msg.sendDate).getTime() - difsTimeZones))
    }

    function getOffsetBetweenTimezonesForDate(date, timezone1, timezone2) {
        const timezone1Date = convertDateToAnotherTimeZone(date, timezone1);
        const timezone2Date = convertDateToAnotherTimeZone(date, timezone2);
        return timezone1Date.getTime() - timezone2Date.getTime();
    }

    function convertDateToAnotherTimeZone(date, timezone) {
        const dateString = date.toLocaleString('en-US', {
            timeZone: timezone
        });
        return new Date(dateString);
    }

    async function getFiles() {
        setFiles([])
        let preview = [];
        if (msg.attachmentsBlobForImageClient && msg.attachmentsBlobForImageClient.length > 0) {
            for (let i = 0; i < msg.attachmentsBlobForImageClient.length; i++) {
                if (msg.attachmentsBlobForImageClient[i].name.endsWith(".jpg") ||
                    msg.attachmentsBlobForImageClient[i].name.endsWith(".png") ||
                    msg.attachmentsBlobForImageClient[i].name.endsWith(".dcm")
                ) {
                    console.log(msg.attachmentsBlobForImageClient[i])
                    preview.push({
                        id: msg.localFiles[i].id,
                        image: URL.createObjectURL(msg.attachmentsBlobForImageClient[i])
                    })
                }
            }
        } else if (msg.localFiles && msg.localFiles.length > 0) {
            for (let i = 0; i < msg.localFiles.length; i++) {
                if (msg.localFiles[i].fileName.endsWith(".jpg") ||
                    msg.localFiles[i].fileName.endsWith(".png")) {
                    const base64Data = msg.localFiles[i].fileContent
                    const base64Response = await fetch(`data:application/json;base64,${base64Data}`)
                    const blob = await base64Response.blob()
                    preview.push({id: msg.localFiles[i].id, image: URL.createObjectURL(blob)})
                }
            }
        } else if (msg.dataFilesDicom && msg.dataFilesDicom.length > 0) {
            for (let i = 0; i < msg.dataFilesDicom.length; i++) {
                const base64Data = msg.dataFilesDicom[i]
                const base64Response = await fetch(`data:application/json;base64,${base64Data}`)
                const blob = await base64Response.blob()
                preview.push({id: msg.attachments[i].id, image: URL.createObjectURL(blob), uid: msg.uidFilesDicom[i]})
            }
        }
        setFiles(preview)
    }

    function openDicomViewer(uid) {
        const url = window.location.href
        const num = url.indexOf(":7999")
        window.open(url.slice(0, num + 1) + "3000/viewer/" + uid, '_blank')
    }

    return (
        <Grid>
            <Paper className={classes.msgNotMy}>
                <Grid className={classes.txt}>
                    <Link to={"/profile/" + msg.senderName} className={classes.link}>
                        {initialsSender}
                    </Link>
                </Grid>
                <Grid>
                    <Grid>{msg.content}</Grid>
                    {files &&
                    <Grid>
                        <ImageList cols={1} rowHeight={200} gap={3}>
                            {files.map((file, index) =>
                                <ImageListItem key={index}>
                                    {file.uid ?
                                        // <Tooltip title="Открыть в DICOM Viewer">
                                        //     {/*TODO тоже сделать, как в record-card*/}
                                        //     <a href={"http://localhost:3000/viewer/" + file.uid}
                                        //        target="_blank">
                                        //         <Button>
                                        //             <img
                                        //                 src={file.image}
                                        //                 srcSet={file.image}
                                        //                 alt={file.id}
                                        //                 loading="lazy"
                                        //             />
                                        //         </Button>
                                        //     </a>
                                        // </Tooltip>
                                        <Tooltip title="Открыть в DICOM Viewer">
                                            <img onClick={() => openDicomViewer(file.uid)}
                                                 src={file.image}
                                                 srcSet={file.image}
                                                 alt={file.id}
                                                 loading="lazy"
                                                 style={{cursor: 'pointer'}}
                                            >
                                            </img>
                                        </Tooltip>
                                        :
                                        <img
                                            src={file.image}
                                            srcSet={file.image}
                                            alt={file.id}
                                            loading="lazy"
                                        />
                                    }
                                </ImageListItem>
                            )}
                        </ImageList>
                    </Grid>
                    }
                </Grid>
                <Grid
                    className={classes.time}>
                    {
                        (((new Date(timeMsgCurrentTimeZone).getHours() < 10 && "0" + new Date(timeMsgCurrentTimeZone).getHours())
                                || (new Date(timeMsgCurrentTimeZone).getHours() >= 10 && new Date(timeMsgCurrentTimeZone).getHours())) + ":"
                            + ((new Date(timeMsgCurrentTimeZone).getMinutes() < 10 && "0" + new Date(timeMsgCurrentTimeZone).getMinutes())
                                || (new Date(timeMsgCurrentTimeZone).getMinutes() > 10 && new Date(timeMsgCurrentTimeZone).getMinutes())
                            )) + "    " + (
                            ((new Date(timeMsgCurrentTimeZone).getDate() < 10 && "0" + new Date(timeMsgCurrentTimeZone).getDate()) || (new Date(timeMsgCurrentTimeZone).getDate() >= 10 && new Date(timeMsgCurrentTimeZone).getDate()))
                            + "."
                            + (((new Date(timeMsgCurrentTimeZone).getMonth() + 1) < 10 && "0" + (new Date(timeMsgCurrentTimeZone).getMonth() + 1)) || (((new Date(timeMsgCurrentTimeZone).getMonth() + 1) >= 10 && (new Date(timeMsgCurrentTimeZone).getMonth() + 1))))
                            + "." + new Date(timeMsgCurrentTimeZone).getFullYear()
                        )
                    }
                </Grid>
            </Paper>
        </Grid>
    );

}

export default withStyles(useStyles)(RecipientMsg)