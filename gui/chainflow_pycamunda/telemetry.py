# -*- coding: utf-8 -*-

"""This module provides access to the telemetry REST api of Camunda."""

from __future__ import annotations

import chainflow_pycamunda
import chainflow_pycamunda.base
import chainflow_pycamunda.resource
from chainflow_pycamunda.request import BodyParameter

URL_SUFFIX = '/telemetry/configuration'


__all__ = ['Configure', 'Fetch']


class Configure(chainflow_pycamunda.base.CamundaRequest):

    enable_telemetry = BodyParameter('enableTelemetry')

    def __init__(self, url: str, enable_telemetry: bool):
        """Modify the telemetry configuration.

        :param url: Camunda Rest engine URL.
        :param enable_telemetry: Whether to enable telemetry configuration.
        """
        super().__init__(url=url + URL_SUFFIX)
        self.enable_telemetry = enable_telemetry

    def __call__(self, *args, **kwargs) -> None:
        """Send the request."""
        super().__call__(chainflow_pycamunda.base.RequestMethod.POST, *args, **kwargs)


class Fetch(chainflow_pycamunda.base.CamundaRequest):

    def __init__(self, url: str):
        """Fetch the telemetry configuration.

        :param url: Camunda Rest engine URL.
        """
        super().__init__(url=url + URL_SUFFIX)

    def __call__(self, *args, **kwargs) -> bool:
        """Send the request."""
        response = super().__call__(chainflow_pycamunda.base.RequestMethod.GET, *args, **kwargs)

        return response.json()['enableTelemetry']
