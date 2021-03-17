import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { getPopulatedExam } from '../../services/examApi/getPopulatedExam';
import { InvigilatorView } from './InvigilatorView';
import { Layout } from './Layout';
import { StudentView } from './StudentView';

export const Exam = () => {
  const { isInvigilator } = useAuth();

  const { id } = useParams<{ id: string }>();
  const { fetchData, data, isFetching } = useFetch(getPopulatedExam);

  useEffect(() => {
    id && fetchData(id);
  }, [id]);

  return isFetching || !data ? (
    <></>
  ) : (
    <Layout exam={data}>
      {isInvigilator ? (
        <InvigilatorView exam={data} />
      ) : (
        <StudentView exam={data} />
      )}
    </Layout>
  );
};
