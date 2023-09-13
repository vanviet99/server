import { useTranslation } from "react-i18next";
import BarChartIcon from "@mui/icons-material/BarChart";
import { FaCoins, FaUserEdit } from "react-icons/fa";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";
import chromeTask from "../services/chrome";
import { Table } from "antd";
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";
import Loading from "./Loading";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const TableAdacounts = (props) => {
  const { listAd, isMix, token } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectRemove, setselectRemove] = useState([]);
  const handleClose = () => {
    setOpen(false);
    setdatamodal({});
  };
  const [datamodal, setdatamodal] = useState({});
  const [loading, setloading] = useState(false);

  const handleOpen = async (data) => {
    setloading(true);
    setOpen(true);
    setselectRemove([]);
    try {
      const res = await chromeTask.getAdminADhire(data.ID, data.bm);
      console.log({ ID: data.ID, array: res, bm: data.bm }, 3000);
      setdatamodal({ ID: data.ID, array: res, bm: data.bm });
      setloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const [messagestatus, setmessagestatus] = useState({
    type: "success",
    mess: "",
  });

  const handleRemoveAdminAD = async (userID) => {
    console.log(userID , selectRemove, "userID");
    setloading(true);
    if (selectRemove.length <= 1) {
      try {
        const deletes = await chromeTask.deleteAdminAD(
          datamodal.ID,
          userID,
          token
        );
        console.log(deletes, "deletes");
        if (deletes.success) {
          setdeleteone(null);
          setloading(false);
          setmessagestatus({ type: "success", mess: "Xoa thanh cong" });
          setOpenSnackbar(true);
        } else {
          setdeleteone(null);
          setloading(false);
          setmessagestatus({ type: "error", mess: deletes.error.message });
          setOpenSnackbar(true);
        }

        const res = await chromeTask.getAdminADhire(datamodal.ID, datamodal.bm);
        setdatamodal({ ...datamodal, array: res });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemoveAdminADarray = async () => {
    setloading(true);
    const deletesarray = async () => {
      let datas = selectRemove.map(async (value, index) => {
        let deletesss = await chromeTask.deleteAdminAD(
          datamodal.ID,
          value.remove,
          token
        );
        return deletesss;
      });
      return await Promise.all(datas);
    };
    let checked = await deletesarray();
    console.log(checked, "handleRemoveAdminAD");
    if (!checked[0].error) {
      setloading(false);
      setmessagestatus({ type: "success", mess: "Xoa thanh cong" });
      setOpenSnackbar(true);
      const res = await chromeTask.getAdminADhire(datamodal.ID, datamodal.bm);
      setdatamodal({ ...datamodal, array: res });
    } else {
      setloading(false);
      setmessagestatus({ type: "error", mess: checked[0].error.message });
      setOpenSnackbar(true);
    }
  };

  const data = datamodal.array?.map((value, index) => {
    return {
      key: `${index}`,
      name: `${value.name}-${value.id}`,
      role: t(value.role),
      status: value.isAdminHide ? t("hiddenAdmin") : "Active",
      remove: value.id,
    };
  });

  const [deleteone, setdeleteone] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const columns = [
    {
      title: t("name"),
      dataIndex: "name",
      render: (text) => (
        <div>
          <div className="items__table">{text.split("-")[0]}</div>
          <div className="items__table">{text.split("-")[1]}</div>
        </div>
      ),
    },
    {
      title: t("role"),
      dataIndex: "role",
    },
    {
      title: t("status"),
      dataIndex: "status",
    },
    {
      title: (
        <div
          className="remove__btn"
          onClick={() => {
            setmodalConfirm(true);
          }}
        >{`${t("removeAll")}( ${selectRemove.length})`}</div>
      ),
      dataIndex: "remove",
      render: (text) => (
        <button
          disabled={selectRemove.length >= 2}
          className={` btn_remove_style ${
            selectRemove.length >= 2 ? "remove__btn__disable" : "remove__btn"
          }`}
          onClick={() => {
            setdeleteone(text);
            setmodalConfirm(true);
          }}
        >
          {t("remove")}
        </button>
      ),
    },
  ];

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 650,
    bgcolor: "background.paper",
    border: "2px solid #0a2e61",
    boxShadow: 24,
    borderRadius: 2,
    overflow: "hidden",
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setselectRemove(selectedRows);
    },
  };
  const listAdclone = listAd ? [...listAd] : [];
  const [dataAD, setDataAD] = useState(listAd);
  const [selectsort, setSelectsort] = useState({ key: "", count: 0 });

  useEffect(() => {
    setDataAD(listAd);
  }, [listAd]);

  const handleFilters = (values) => {
    if (values.key === null) {
      return;
    }
    var newSelect = { ...selectsort };
    if (values.key !== selectsort.key) {
      newSelect.key = values.key;
      newSelect.count = 1;
    } else {
      newSelect.count = selectsort.count + 1;
    }
    setSelectsort(newSelect);

    if (newSelect.count % 2 === 0) {
      let newdata = listAdclone.sort(function (a, b) {
        var nameA = a[`${values.key}`].toString().toLowerCase();
        var nameB = b[`${values.key}`].toString().toLowerCase();
        if (!isNaN(nameA) && !isNaN(nameB)) {
          // Nếu cả hai là số, sắp xếp theo giá trị số
          return parseInt(nameA) - parseInt(nameB);
        } else {
          // Cả hai không phải số, sắp xếp theo thứ tự từ điển
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        }
      });
      setDataAD(newdata);
    } else {
      let newdata = listAdclone.sort(function (a, b) {
        var nameA = a[`${values.key}`].toString().toLowerCase();
        var nameB = b[`${values.key}`].toString().toLowerCase();
        if (!isNaN(nameA) && !isNaN(nameB)) {
          // Nếu cả hai là số, sắp xếp theo giá trị số (ngược lại)
          return parseInt(nameB) - parseInt(nameA);
        } else {
          // Cả hai không phải số, sắp xếp theo thứ tự từ điển (ngược lại)
          if (nameA < nameB) {
            return 1;
          }
          if (nameA > nameB) {
            return -1;
          }
          return 0;
        }
      });
      setDataAD(newdata);
    }

    // if (values.interface === "string") {
    //   if (newSelect.count % 2 === 0) {
    //     let newdata = listAdclone.sort((a, b) =>
    //       b[`${values.key}`].localeCompare(a[`${values.key}`])
    //     );
    //     setDataAD(newdata);
    //   } else {
    //     let newdata = listAdclone.sort((a, b) =>
    //       a[`${values.key}`].localeCompare(b[`${values.key}`])
    //     );
    //     setDataAD(newdata);
    //   }
    // }
    // if (values.interface === "number") {
    //   if (newSelect.count % 2 === 0) {
    //     let datas = listAdclone.sort(
    //       (a, b) => b[`${values.key}`] - a[`${values.key}`]
    //     );
    //     setDataAD(datas);
    //   } else {
    //     let datas = listAdclone.sort(
    //       (a, b) => a[`${values.key}`] - b[`${values.key}`]
    //     );
    //     setDataAD(datas);
    //   }
    // }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "active":
        return "g-status";
      case "disable":
        return "r-status";
      case "close":
        return "b-status";
      case "needPay":
        return "y-status";
      case "period":
        return "p-status";
      default:
        return "d-status";
    }
  };

  const thTable = [
    { value: t("no"), interface: "number", key: "stt" },
    { value: t("status"), interface: "string", key: "status" },
    { value: t("action"), interface: "string", key: null },
    { value: t("id"), interface: "string", key: "id" },
    { value: t("name"), interface: "string", key: "name" },
    {
      value: t("balance"),
      interface: "number",
      key: isMix ? "balance" : "h_balance",
    },
    {
      value: t("thresshold"),
      interface: "string",
      key: isMix ? "threshold" : "h_threshold",
    },
    {
      value: "Limit",
      interface: "number",
      key: isMix ? "adtrust" : "h_adtrust",
    },
    {
      value: t("spent"),
      interface: "number",
      key: isMix ? "spent" : "h_spent",
    },
    { value: t("admin"), interface: "string", key: "admin" },
    { value: t("currency"), interface: "string", key: "currency" },
    { value: t("accountType"), interface: "string", key: "acctype" },
    { value: t("role"), interface: "string", key: "role" },
    { value: t("idbm"), interface: "string", key: "bm" },
    { value: t("payment"), interface: "string", key: "card" },
    { value: t("timezone"), interface: "string", key: "timezone" },
  ];

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const [modalconfirm, setmodalConfirm] = useState(false);

  const handleClosemodalConfirm_close = () => {
    setmodalConfirm(false);
  };

  const handleClosemodalConfirm_delete = () => {
    if (deleteone) {
      setmodalConfirm(false);
      handleRemoveAdminAD(deleteone);
    } else {
      setmodalConfirm(false);
      handleRemoveAdminADarray();
    }
  };

  return (
    <div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={messagestatus.type}
          sx={{ width: "100%" }}
        >
          {messagestatus.mess}
        </Alert>
      </Snackbar>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="relative" style={{ height: 400, width: "100%" }}>
            {modalconfirm ? (
              <div className="absolute modal_confirm flex_s">
                <div className="bg-white">
                  <h3 className="m-0">{t("delete")}</h3>
                  <p>{t("Are you sure you want to delete ?")}</p>
                  <div className="modal_confirm__btns">
                    <button
                      onClick={handleClosemodalConfirm_close}
                      className="modal_confirm__btn__close"
                    >
                      {t("close")}
                    </button>
                    <button
                      onClick={handleClosemodalConfirm_delete}
                      className="modal_confirm__btn__delete"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <h3 className="header__modal">{`Account Id: ${
              datamodal ? datamodal.ID : "..."
            } - ${t("admin")} (${
              datamodal.array?.length ? datamodal.array?.length : 0
            })`}</h3>
            {loading ? <Loading loadingoption="loading__modal" /> : null}
            <Table
              className="over"
              pagination={false}
              size="small"
              rowSelection={{
                ...rowSelection,
              }}
              columns={columns}
              dataSource={data}
            />
          </div>
        </Box>
      </Modal>
      <table>
        <thead>
          <tr>
            {thTable.map((value, index) => {
              return (
                <th
                  key={index}
                  className="btn_header_table"
                  onClick={() => {
                    handleFilters(value);
                  }}
                  style={{
                    minWidth: `${index > 0 ? "100px" : "50px"}`,
                  }}
                >
                  <div className="flex_s header_flex">
                    <span>{value.value}</span>
                    <div
                      className={`flex_s header_flex icon_header ${
                        selectsort.count === 0 ||
                        (selectsort.key === value.key && selectsort.count > 0)
                          ? "visible"
                          : "invisible"
                      }`}
                    >
                      <div
                        className={`icon_header1 mb-0.5 ${
                          selectsort.count % 2 === 0 && selectsort.count > 0
                            ? "icon_header_action"
                            : ""
                        }`}
                      >
                        <i className="fa-solid fa-caret-up" />
                      </div>
                      <div
                        className={`icon_header2 ${
                          selectsort.count % 2 === 1 ? "icon_header_action" : ""
                        }`}
                      >
                        <i className="fa-solid fa-caret-down"></i>
                      </div>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {listAd &&
            dataAD.map((item) => {
              return (
                <tr key={`${item.stt}`}>
                  <td>{item.stt}</td>
                  <td>
                    <div className={`status ${formatStatus(item.status)}`}>
                      <div>{t(item.status)}</div>{" "}
                    </div>
                  </td>
                  <td>
                    <div className="flex_s">
                      <a
                        href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fa-solid fa-chart-simple icon2" />
                      </a>
                      <a
                        href={`https://adsmanager.facebook.com/ads/manager/account_settings/account_billing/?act=${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fa-solid fa-coins icon1" />
                      </a>
                    </div>
                  </td>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td className={isMix ? "color_mix" : "color_usd"}>
                    {isMix
                      ? item.balance.toLocaleString("en-US").replace(".", ".")
                      : item.h_balance
                          .toLocaleString("en-US")
                          .replace(".", ".")}
                  </td>
                  <td className={isMix ? "color_mix" : "color_usd"}>
                    {isMix
                      ? item.threshold.toLocaleString("en-US").replace(".", ".")
                      : item.h_threshold
                          .toLocaleString("en-US")
                          .replace(".", ".")}
                  </td>
                  <td className={isMix ? "color_mix" : "color_usd"}>
                    {isMix
                      ? item.adtrust.toLocaleString("en-US").replace(".", ".")
                      : item.h_adtrust
                          .toLocaleString("en-US")
                          .replace(".", ".")}
                  </td>
                  <td className={isMix ? "color_mix" : "color_usd"}>
                    {isMix
                      ? item.spent.toLocaleString("en-US").replace(".", ".")
                      : item.h_spent.toLocaleString("en-US").replace(".", ".")}
                  </td>
                  <td>
                    <div className="flex_s">
                      {item.admin}
                      <FaUserEdit
                        onClick={() => {
                          handleOpen({
                            ID: item.id,
                            array: item.adminarray,
                            bm: item.bm,
                          });
                        }}
                        className="icon3 "
                      />
                    </div>
                  </td>
                  <td>{item.currency}</td>
                  <td>{t(item.acctype)}</td>
                  <td>{t(item.role)}</td>
                  <td>{item.bm}</td>
                  <td>{item.card}</td>
                  <td>{item.timezone}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default TableAdacounts;
