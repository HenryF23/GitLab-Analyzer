from typing import Union
import datetime
from dateutil import parser
from server.interface.gitlab_interface import GitLab
from server.model.MergeRequest import MergeRequest
import gitlab


class MergeRequestManager:
    def __init__(self) -> None:
        self.__mergeRequestList: list = []

    def add_merge_request(self, mergeRequest: gitlab) -> None:
        self.__mergeRequestList.append(MergeRequest(mergeRequest))

    def get_merge_request_by_id(self, myId) -> Union[MergeRequest, None]:
        for mergeRequest in self.__mergeRequestList:
            if mergeRequest.id == myId:
                return mergeRequest
        return None

    def get_merge_request_by_iid(self, myIid) -> Union[MergeRequest, None]:
        for mergeRequest in self.__mergeRequestList:
            if mergeRequest.iid == myIid:
                return mergeRequest
        return None

    def get_merge_requests_by_range(self, startDate, endDate) -> list:
        myStartDate: datetime = parser.parse(startDate)
        myEndDate: datetime = parser.parse(endDate)
        tempMergeRequestList: list = []
        for mergeRequest in self.__mergeRequestList:
            tempStartDate = mergeRequest.created_date
            if myStartDate <= tempStartDate <= myEndDate:
                tempMergeRequestList.append(mergeRequest)
        return tempMergeRequestList
