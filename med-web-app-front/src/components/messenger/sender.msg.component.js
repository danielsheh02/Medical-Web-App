import React, {useEffect, useRef, useState} from "react";
import '../../styles/Search.css'
import {
    Collapse,
    Dialog, DialogActions,
    DialogContent, DialogContentText,
    ImageList,
    ImageListItem,
    Paper, Tooltip,
    withStyles
} from "@material-ui/core";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import AuthService from "../../services/auth.service";
import ChatService from "../../services/chat.service"
import Button from "@material-ui/core/Button";
import DeleteIcon from '@mui/icons-material/Delete';

const useStyles = theme => ({

    msgMy: {
        width: "fit-content",
        height: "fit-content",
        margin: 20,
        marginLeft: "auto",
        backgroundColor: '#a1e9ff',
        padding: theme.spacing(0.5),
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        maxWidth: 400,
    },
    txt: {
        fontWeight: 'bold',
        marginTop: 0,
        marginBottom: 10,
    },
    time: {
        color: '#888888',
        fontSize: 12,
        marginTop: theme.spacing(0.5),
        textAlign: "right"
    },
    link: {
        color: "black",
    },
    collapsed: {
        marginTop: -3,
        marginLeft: 3,
        color: '#888888',
        float: "right",
        '&:hover': {
            cursor: "pointer",
        }
    },
    paperDelete: {
        '&:hover': {
            cursor: "pointer",
            textDecoration: 'underline'
        },
    },
    button: {
        backgroundColor: '#f50057',
        color: '#fff',
        '&:hover': {
            backgroundColor: '#ff5983',
            color: '#fff',
        }
    },
});

function SenderMsg(props) {
    const {classes} = props
    const {msg} = props
    const {scrollToBottom} = props
    const {deleteMsgClient} = props
    const [files, setFiles] = useState([])
    const [checked, setChecked] = useState(false)
    const [showPaper, setShowPaper] = useState(false)
    const [paperX, setPaperX] = useState(false)
    const [paperY, setPaperY] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [timeMsgCurrentTimeZone, setTimeMsgCurrentTimeZone] = useState([])
    const KeyboardArrowDownIconRef = useRef();
    useEffect(async () => {
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

    function agreeToDelete() {
        if (msg.id) {
            ChatService.deleteMsg(msg)
        } else {
            ChatService.deleteMsgByTimeAndChatId(msg.sendDate, msg.senderName, msg.recipientName)
        }
        deleteMsgClient(msg)
        setOpenDialog(false)
        setChecked(false)
    }

    function disagreeToDelete() {
        setChecked(false)
        setOpenDialog(false)
    }

    function deleteMsg() {
        setOpenDialog(true)
    }

    function handleClick(e) {
        console.log(msg)
        if (!showPaper) {
            setPaperX(KeyboardArrowDownIconRef.current.getBoundingClientRect().x - 165)
            setPaperY(KeyboardArrowDownIconRef.current.getBoundingClientRect().y + 20)
            setShowPaper(true)
        } else {
            setShowPaper(false)
        }
    }

    function openDicomViewer(uid) {
        const url = window.location.href
        const num = url.indexOf(":7999")
        window.open(url.slice(0, num + 1) + "3000/viewer/" + uid, '_blank')
    }

    return (
        <Grid>

            <Paper className={classes.msgMy} onMouseOver={() => setChecked(true)}
                   onMouseLeave={() => setChecked(false)}>
                <Grid>
                    <Grid style={{display: "flex"}}>
                        <Grid className={classes.txt}>
                            <Link to={"/profile/" + msg.senderName} className={classes.link}>
                                {AuthService.getCurrentUser().initials}
                            </Link>
                        </Grid>
                        <Grid>
                            <Collapse in={checked}>
                                {/*<KeyboardArrowDownIcon onClick={(e => handleClick(e))} ref={KeyboardArrowDownIconRef}*/}
                                {/*                       className={classes.collapsed}/>*/}
                                <DeleteIcon onClick={(e => deleteMsg(e))} ref={KeyboardArrowDownIconRef}
                                            className={classes.collapsed}/>
                            </Collapse>
                            <Dialog
                                open={openDialog}
                                onClose={disagreeToDelete}
                            >
                                <DialogContent>
                                    <DialogContentText style={{fontSize: 20, color: "black"}}>
                                        Вы уверены, что хотите удалить сообщение?
                                        <br/>
                                    </DialogContentText>
                                    <DialogActions>
                                        <Button
                                            className={classes.button}
                                            onClick={disagreeToDelete}>
                                            Нет
                                        </Button>
                                        <Button className={classes.button}
                                                onClick={agreeToDelete}>
                                            Да
                                        </Button>
                                    </DialogActions>
                                </DialogContent>
                            </Dialog>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Grid>{msg.content}</Grid>
                        {files &&
                        <Grid>
                            < ImageList cols={1} rowHeight={200} gap={3}>
                                {files.map((file, index) =>
                                    <ImageListItem key={index}>
                                        {file.uid ?
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
                </Grid>
            </Paper>
        </Grid>
    );

}

export default withStyles(useStyles)(SenderMsg)