import { Grid, Paper, Title } from '@mantine/core';
import { getDisplayString, resolveId } from '@medplum/core';
import { Coverage, Organization, Patient, Reference, RelatedPerson } from '@medplum/fhirtypes';
import {
  Document,
  HumanNameDisplay,
  MedplumLink,
  PatientSummary,
  useMedplum,
  useMedplumNavigate,
  useResource,
} from '@medplum/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CoverageActions } from '../components/actions/CoverageActions';
import { CoverageDetails } from '../components/CoverageDetails';
import { CoverageHeader } from '../components/CoverageHeader';

export function CoveragePage(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useMedplumNavigate();
  const { id } = useParams() as { id: string };
  const [coverage, setCoverage] = useState<Coverage | undefined>();
  const [patient, setPatient] = useState<Patient>();

  const tabs = ['Details', 'History', 'Eligibility Requests', 'Eligibility Responses'];

  // Set the current tab to what is in the URL. If no tab, default to Details
  const tab = window.location.pathname.split('/').pop();
  const currentTab = tab && tabs.map((t) => t.toLowerCase()).includes(tab) ? tab : tabs[0].toLowerCase();

  // Get a reference to the patient covered by the Coverage
  const patientReference = coverage?.beneficiary;

  useEffect(() => {
    const fetchCoverage = async (): Promise<void> => {
      try {
        // Get the coverage details for the given resource
        const coverageData = await medplum.readResource('Coverage', id);
        setCoverage(coverageData);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchLinkedPatient = async (): Promise<void> => {
      if (patientReference) {
        const patientId = resolveId(patientReference) as string;
        try {
          // Search for the details of the patient covered by the Coverage
          const patientData = await medplum.readResource('Patient', patientId);
          setPatient(patientData);
        } catch (err) {
          console.error(err);
        }
      }
    };

    const fetchData = async (): Promise<void> => {
      await fetchCoverage();
      await fetchLinkedPatient();
    };

    fetchData().catch((err) => console.error(err));
  });

  const onCoverageChange = (updatedCoverage: Coverage): void => {
    setCoverage(updatedCoverage);
  };

  // Update the current tab and navigate to its URL
  const handleTabChange = (newTab: string | null): void => {
    navigate(`/Coverage/${id}/${newTab ?? ''}`);
  };

  if (!coverage || !patient) {
    return <Document>No Coverage Found</Document>;
  }

  return (
    <div>
      <CoverageHeader patient={patient} payor={coverage.payor[0]} />
      <Grid>
        <Grid.Col span={4}>{patient ? <PatientSummary patient={patient} /> : <p>No linked patient</p>}</Grid.Col>
        <Grid.Col span={5}>
          <Paper p="sm">
            <Title>Coverage Details</Title>
            <CoverageDetails
              coverage={coverage}
              patient={patient}
              tabs={tabs}
              currentTab={currentTab}
              handleTabChange={handleTabChange}
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Actions coverage={coverage} onChange={onCoverageChange} />
        </Grid.Col>
      </Grid>
    </div>
  );
}

interface ActionsProps {
  readonly coverage: Coverage;
  readonly onChange: (updatedCoverage: Coverage) => void;
}

function Actions({ coverage, onChange }: ActionsProps): JSX.Element {
  return (
    <Paper p="md">
      <CoverageActions coverage={coverage} onChange={onChange} />
    </Paper>
  );
}
